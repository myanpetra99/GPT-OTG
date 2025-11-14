const DEFAULT_SETTINGS = {
  tune: "balance",
  gptModel: "openai-gpt-4o-mini",
  youtubeSummary: true,
  aiCommand: true,
  googleSearch: true,
  initialPrompt: `You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user's instructions.
Respond using Markdown and keep answers concise but complete.
When creating content for the user, answer directly without filler phrases.
After answering, provide follow-up ideas prefixed with "GPT-SUGGEST:" in JSON format.`,
  openaiApiKey: "",
  geminiApiKey: "",
  anthropicApiKey: "",
  deepseekApiKey: "",
};

const MODEL_CONFIGS = {
  "openai-gpt-4o-mini": {
    id: "openai-gpt-4o-mini",
    name: "OpenAI GPT-4o mini",
    provider: "openai",
    model: "gpt-4o-mini",
    endpoint: "https://api.openai.com/v1/chat/completions",
    supportsStreaming: true,
    capabilities: ["text"],
  },
  "openai-gpt-4o": {
    id: "openai-gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "openai",
    model: "gpt-4o",
    endpoint: "https://api.openai.com/v1/chat/completions",
    supportsStreaming: true,
    capabilities: ["text"],
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    model: "gemini-1.5-flash",
    supportsStreaming: false,
    capabilities: ["text", "vision"],
  },
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    model: "gemini-2.0-flash-exp",
    supportsStreaming: false,
    capabilities: ["text"],
  },
  "anthropic-claude-3-5-sonnet": {
    id: "anthropic-claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20240620",
    endpoint: "https://api.anthropic.com/v1/messages",
    supportsStreaming: false,
    capabilities: ["text"],
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    model: "deepseek-chat",
    endpoint: "https://api.deepseek.com/chat/completions",
    supportsStreaming: true,
    capabilities: ["text"],
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    model: "deepseek-reasoner",
    endpoint: "https://api.deepseek.com/chat/completions",
    supportsStreaming: true,
    capabilities: ["text"],
  },
};

const TUNING_PRESETS = {
  creative: { temperature: 0.9, topP: 0.9 },
  balance: { temperature: 0.7, topP: 0.8 },
  precise: { temperature: 0.4, topP: 0.65 },
};

const FOLLOW_UP_INSTRUCTION = `Provide one or more follow-up questions the user might ask next.
Format the suggestions exactly as a JSON array like this:
[{"suggestion":"1","text":"Question text"}].
Keep each suggestion concise.`;

let cachedSettings = { ...DEFAULT_SETTINGS };
let ttsReady = false;

chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
  cachedSettings = { ...cachedSettings, ...items };
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") {
    return;
  }

  Object.entries(changes).forEach(([key, { newValue }]) => {
    if (typeof newValue === "undefined") {
      cachedSettings[key] = DEFAULT_SETTINGS[key];
    } else {
      cachedSettings[key] = newValue;
    }
  });
});

function getModelConfig(modelId) {
  return MODEL_CONFIGS[modelId] || MODEL_CONFIGS[DEFAULT_SETTINGS.gptModel];
}

function getTuningPreset(tune) {
  return TUNING_PRESETS[tune] || TUNING_PRESETS.balance;
}

function getApiKeyForProvider(provider) {
  switch (provider) {
    case "openai":
      return (cachedSettings.openaiApiKey || "").trim();
    case "gemini":
      return (cachedSettings.geminiApiKey || "").trim();
    case "anthropic":
      return (cachedSettings.anthropicApiKey || "").trim();
    case "deepseek":
      return (cachedSettings.deepseekApiKey || "").trim();
    default:
      return "";
  }
}

function parseSuggestionsFromText(rawText) {
  if (!rawText) {
    return [];
  }

  const withoutPrefix = rawText.replace(/^GPT-SUGGEST:\s*/i, "").trim();
  const unwrapped = withoutPrefix
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const jsonMatch = unwrapped.match(/\{.*\}|\[.*\]/s);
  const candidate = jsonMatch ? jsonMatch[0] : unwrapped;

  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            return { suggestion: item, text: item };
          }
          return {
            suggestion: item.suggestion || item.id || item.text || "",
            text: item.text || item.suggestion || "",
          };
        })
        .filter((item) => item.text);
    }

    if (parsed && typeof parsed === "object") {
      const fromKey = parsed["GPT-SUGGEST"] || parsed.suggestions || parsed.items;
      if (Array.isArray(fromKey)) {
        return fromKey
          .map((text) => {
            if (typeof text === "string") {
              return { suggestion: text, text };
            }
            return {
              suggestion: text?.suggestion || text?.text || "",
              text: text?.text || text?.suggestion || "",
            };
          })
          .filter((item) => item.text);
      }
    }
  } catch (error) {
    console.warn("Unable to parse suggestion payload", error, rawText);
  }

  return [];
}

async function maybeAugmentPromptWithInternet(prompt) {
  try {
    const internetMode = localStorage.getItem("gptinternet");
    if (internetMode !== "true") {
      return prompt;
    }

    const searchUrl = `https://gpt-otg-websearch-api.vercel.app/search?query=${encodeURIComponent(prompt)}`;
    const response = await fetch(searchUrl, {
      credentials: "omit",
      mode: "cors",
    });
    if (!response.ok) {
      return prompt;
    }
    const internetPrompt = await response.text();
    return internetPrompt || prompt;
  } catch (error) {
    console.warn("Failed to augment prompt with internet results", error);
    return prompt;
  }
}

function buildSuggestionButtons(suggestions, onSelect) {
  const wrapper = document.querySelector(".popup-suggestion-wrapper");
  if (!wrapper) {
    return;
  }
  wrapper.innerHTML = "";
  if (!suggestions?.length) {
    wrapper.classList.remove("has-suggestions");
    return;
  }
  wrapper.classList.add("has-suggestions");
  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("suggestion-button");
    button.textContent = suggestion.text;
    button.addEventListener("click", () => onSelect(suggestion.text));
    wrapper.appendChild(button);
  });
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}

async function requestGeminiContent({ model, apiKey, systemPrompt, tuning, parts }) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Add it from the options page.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: tuning.temperature,
      topP: tuning.topP,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = {
      role: "system",
      parts: [{ text: systemPrompt }],
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return extractGeminiText(data);
}

function guessMimeTypeFromUrl(url) {
  try {
    const { pathname } = new URL(url);
    const extension = pathname.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "svg":
        return "image/svg+xml";
      case "bmp":
        return "image/bmp";
      case "ico":
        return "image/x-icon";
      default:
        return "image/jpeg";
    }
  } catch (error) {
    return "image/jpeg";
  }
}

async function fetchImageInlineParts(imageUrl) {
  const response = await fetch(imageUrl, {
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Image download failed: ${response.status} ${errorText}`.trim());
  }

  const mimeType = response.headers.get("Content-Type") || guessMimeTypeFromUrl(imageUrl);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);

  return [
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ];
}

async function callOpenAiCompatible({
  prompt,
  systemPrompt,
  tuning,
  onChunkReceived,
  config,
  apiKey,
}) {
  if (!apiKey) {
    throw new Error("Add your API key for the selected provider in the options page.");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    Authorization: `Bearer ${apiKey}`,
  };

  const baseMessages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const payload = {
    model: config.model,
    messages: baseMessages,
    temperature: tuning.temperature,
    top_p: tuning.topP,
    presence_penalty: 0,
    frequency_penalty: 0,
    stream: config.supportsStreaming,
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model request failed: ${response.status} ${errorText}`);
  }

  let aggregatedText = "";

  if (config.supportsStreaming && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const nextNewline = buffer.indexOf("\n");
        if (nextNewline === -1) {
          break;
        }

        const line = buffer.slice(0, nextNewline);
        buffer = buffer.slice(nextNewline + 1);

        if (line.startsWith("data: ")) {
          const jsonData = line.substring(6).trim();
          if (!jsonData || jsonData === "[DONE]") {
            continue;
          }

          try {
            const chunkJson = JSON.parse(jsonData);
            const chunkContent = chunkJson?.choices?.[0]?.delta?.content;
            if (typeof chunkContent === "string") {
              aggregatedText += chunkContent;
              onChunkReceived(chunkContent);
            }
          } catch (error) {
            console.warn("Failed to parse streamed chunk", error, jsonData);
          }
        }
      }
    }
  } else {
    const data = await response.json();
    const chunkContent = data?.choices?.[0]?.message?.content || "";
    aggregatedText += chunkContent;
    onChunkReceived(chunkContent);
  }

  return {
    text: aggregatedText,
    context: {
      type: "openaiCompatible",
      config,
      headers,
      baseMessages,
      tuning,
    },
  };
}

async function callGemini({ prompt, systemPrompt, tuning, onChunkReceived, config, imageParts = [] }) {
  const apiKey = (cachedSettings.geminiApiKey || "").trim();
  const parts = [...imageParts, { text: prompt }];
  const text = await requestGeminiContent({
    model: config.model,
    apiKey,
    systemPrompt,
    tuning,
    parts,
  });

  if (text) {
    onChunkReceived(text);
  }

  return {
    text,
    context: {
      type: "gemini",
      config,
      apiKey,
      tuning,
      systemPrompt,
    },
  };
}

async function callAnthropic({ prompt, systemPrompt, tuning, onChunkReceived, config }) {
  const apiKey = (cachedSettings.anthropicApiKey || "").trim();
  if (!apiKey) {
    throw new Error("Add your Anthropic API key from the options page to use Claude models.");
  }

  const payload = {
    model: config.model,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
    max_tokens: 1024,
    temperature: tuning.temperature,
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.content?.map((part) => part.text || "").join("") || "";
  if (text) {
    onChunkReceived(text);
  }

  return {
    text,
    context: {
      type: "anthropic",
      config,
      systemPrompt,
      tuning,
      apiKey,
    },
  };
}

async function generateOpenAiSuggestions({ prompt, responseText, context }) {
  const { config, headers, baseMessages, tuning } = context;
  const messages = [
    ...baseMessages,
    { role: "assistant", content: responseText },
    { role: "system", content: FOLLOW_UP_INSTRUCTION },
  ];

  const payload = {
    model: config.model,
    messages,
    temperature: Math.min(tuning.temperature + 0.1, 1),
    top_p: Math.min(tuning.topP + 0.1, 1),
    presence_penalty: 0,
    frequency_penalty: 0,
    stream: false,
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`Suggestion request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return parseSuggestionsFromText(text);
}

async function generateGeminiSuggestions({ prompt, responseText, context }) {
  const { config, apiKey, systemPrompt, tuning } = context;
  const instruction = `The user asked: ${prompt}.\nYou responded: ${responseText}.\n${FOLLOW_UP_INSTRUCTION}`;

  const text = await requestGeminiContent({
    model: config.model,
    apiKey,
    systemPrompt,
    tuning,
    parts: [{ text: instruction }],
  });

  return parseSuggestionsFromText(text);
}

async function generateAnthropicSuggestions({ prompt, responseText, context }) {
  const { config, apiKey, systemPrompt, tuning } = context;
  const payload = {
    model: config.model,
    system: `${systemPrompt}\n\n${FOLLOW_UP_INSTRUCTION}`.trim(),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `User prompt: ${prompt}\nAssistant reply: ${responseText}`,
          },
        ],
      },
    ],
    max_tokens: 512,
    temperature: Math.min(tuning.temperature + 0.15, 1),
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Suggestion request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.map((part) => part.text || "").join("") || "";
  return parseSuggestionsFromText(text);
}

async function renderSuggestions({ prompt, responseText, result }) {
  try {
    if (!responseText) {
      return;
    }

    let suggestions = [];
    if (result.context?.type === "openaiCompatible") {
      suggestions = await generateOpenAiSuggestions({
        prompt,
        responseText,
        context: result.context,
      });
    } else if (result.context?.type === "gemini") {
      suggestions = await generateGeminiSuggestions({
        prompt,
        responseText,
        context: result.context,
      });
    } else if (result.context?.type === "anthropic") {
      suggestions = await generateAnthropicSuggestions({
        prompt,
        responseText,
        context: result.context,
      });
    }

    if (!suggestions.length) {
      return;
    }

    buildSuggestionButtons(suggestions, (followUpPrompt) => {
      const resultElement = document.querySelector("#popup-gpt-result");
      if (resultElement) {
        resultElement.textContent = "";
      }
      fetchFreeGPTResponse(followUpPrompt, (chunk) => {
        if (resultElement) {
          resultElement.textContent += chunk;
        }
      });
    });
  } catch (error) {
    console.warn("Unable to render suggestions", error);
  }
}

async function fetchFreeGPTResponse(prompt, onChunkReceived, options = {}) {
  const suggestionWrapper = document.querySelector(".popup-suggestion-wrapper");
  if (suggestionWrapper) {
    suggestionWrapper.innerHTML = "";
    suggestionWrapper.classList.remove("has-suggestions");
  }

  ttsReady = false;

  const settings = { ...DEFAULT_SETTINGS, ...cachedSettings };
  const config = getModelConfig(settings.gptModel);
  const systemPrompt = (settings.initialPrompt || DEFAULT_SETTINGS.initialPrompt).trim();
  const tuning = getTuningPreset(settings.tune);

  let preparedPrompt = prompt;
  if (!options.imageParts?.length) {
    preparedPrompt = await maybeAugmentPromptWithInternet(prompt);
  }

  if (options.imageParts?.length && !config.capabilities.includes("vision")) {
    onChunkReceived(
      "The selected model cannot analyze images. Please choose a vision-capable model in the options page."
    );
    return "";
  }

  try {
    let result;
    if (config.provider === "openai" || config.provider === "deepseek") {
      const apiKey = getApiKeyForProvider(config.provider);
      result = await callOpenAiCompatible({
        prompt: preparedPrompt,
        systemPrompt,
        tuning,
        onChunkReceived,
        config,
        apiKey,
      });
    } else if (config.provider === "gemini") {
      result = await callGemini({
        prompt: preparedPrompt,
        systemPrompt,
        tuning,
        onChunkReceived,
        config,
        imageParts: options.imageParts,
      });
    } else if (config.provider === "anthropic") {
      result = await callAnthropic({
        prompt: preparedPrompt,
        systemPrompt,
        tuning,
        onChunkReceived,
        config,
      });
    } else {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }

    ttsReady = Boolean(result.text);
    await renderSuggestions({ prompt: preparedPrompt, responseText: result.text, result });
    return result.text;
  } catch (error) {
    console.error("AI request failed", error);
    const message = error?.message || "";
    if (/Gemini API key/.test(message)) {
      onChunkReceived("Please add your Gemini API key from the options page before using this model.");
    } else if (/Anthropic API key/.test(message)) {
      onChunkReceived("Please add your Anthropic API key to chat with Claude.");
    } else if (/Add your API key/.test(message)) {
      onChunkReceived("Please add the required API key for this model in the extension options.");
    } else {
      onChunkReceived("Sorry, something went wrong");
    }
    return "";
  }
}

// list dictionary command
const dictCommand = {
  "/ai": { service: "gpt", mode: "ASK" },
  "/typeai": { service: "gpt", mode: "TYPE" },
};

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// create the popup
function createPopup() {
  const popup = document.createElement("div");
  popup.id = "input-focus-popup";
  popup.style.display = "none";
  popup.style.position = "absolute";
  popup.classList.add("popup-content");
  popup.style.width = "auto";
  popup.style.zIndex = "9999";
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  popup.onmousedown = (event) => {
    isDragging = true;
    prevMousePos = { x: event.clientX, y: event.clientY };
  };

  popup.onmouseup = () => {
    isDragging = false;
  };

  popup.onmouseleave = () => {
    isDragging = false;
  };

  popup.onmousemove = (event) => {
    if (isDragging) {
      const dx = event.clientX - prevMousePos.x;
      const dy = event.clientY - prevMousePos.y;
      const { offsetTop, offsetLeft } = popup;

      popup.style.top = `${offsetTop + dy}px`;
      popup.style.left = `${offsetLeft + dx}px`;

      prevMousePos = { x: event.clientX, y: event.clientY };
    }
  };

  const popupWrapper = document.createElement("div");
  popupWrapper.classList.add("popup-wrapper");

  const header = document.createElement("div");
  header.classList.add("popup-header");

  const titleStack = document.createElement("div");
  titleStack.classList.add("popup-title");
  const title = document.createElement("p");
  title.textContent = "Hello, May I help?";
  titleStack.appendChild(title);

  const toolbar = document.createElement("div");
  toolbar.classList.add("popup-toolbar");

  const internetButton = document.createElement("button");
  internetButton.type = "button";
  internetButton.innerText = "WWW";
  internetButton.classList.add("popup-icon-button");
  internetButton.title = "Toggle web search";
  internetButton.id = "internet-button";
  if (localStorage.getItem("gptinternet") === "true") {
    internetButton.classList.add("enabled");
  }
  internetButton.addEventListener("click", () => {
    ToggleInternetButton();
  });

  const ttsButton = document.createElement("button");
  ttsButton.type = "button";
  ttsButton.innerText = "TTS";
  ttsButton.classList.add("popup-icon-button");
  ttsButton.title = "Speak the answer";
  ttsButton.onclick = () => {
    if (ttsReady) {
      const gptResult = document.querySelector("#popup-gpt-result");
      const utterance = new SpeechSynthesisUtterance(gptResult.textContent);
      function setVoice() {
        const voice = window.speechSynthesis
          .getVoices()
          .find((voice) => voice.name === "Google US English");
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }
      if (window.speechSynthesis.getVoices().length) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
    }
  };

  const gearButton = document.createElement("button");
  gearButton.type = "button";
  gearButton.innerHTML = "&#9881;";
  gearButton.classList.add("popup-icon-button");
  gearButton.title = "Open settings";
  gearButton.onclick = () => {
    chrome.runtime.sendMessage({ action: "OpenOptionsPage" });
  };

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.innerHTML = "&times;";
  closeButton.classList.add("popup-icon-button", "popup-close-button");
  closeButton.title = "Close";
  closeButton.onclick = () => hidePopup(popup, input, gptResult);

  toolbar.appendChild(internetButton);
  toolbar.appendChild(ttsButton);
  toolbar.appendChild(gearButton);
  toolbar.appendChild(closeButton);

  header.appendChild(titleStack);
  header.appendChild(toolbar);

  const inputWrapper = document.createElement("div");
  inputWrapper.style.display = "flex";
  inputWrapper.style.flexDirection = "column";
  inputWrapper.classList.add("popup-input-wrapper");

  const input = document.createElement("input");
  input.type = "text";
  input.style.minWidth = "100px";
  input.oninput = (event) => {
    input.style.width = input.value.length + "ch";
  };
  input.placeholder = "Ask AI!";
  input.classList.add("popup-input");
  input.autocomplete = "off";

  inputWrapper.appendChild(input);

  const suggestionWrapper = document.createElement("div");
  suggestionWrapper.classList.add("popup-suggestion-wrapper");

  popupWrapper.appendChild(header);
  popupWrapper.appendChild(inputWrapper);

  const textareaWrapper = document.createElement("div");
  textareaWrapper.classList.add("textarea-container");

  const gptResult = document.createElement("span");
  gptResult.setAttribute('id',"popup-gpt-result");
  gptResult.setAttribute('role',"textbox");
  gptResult.setAttribute('contenteditable',"true");
  gptResult.readOnly = true;

  textareaWrapper.appendChild(gptResult);

  inputWrapper.appendChild(gptResult);

  inputWrapper.appendChild(suggestionWrapper);

  popup.appendChild(popupWrapper);

  document.body.appendChild(popup);

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      gptResult.textContent = "";
      const userInput = input.value.trim();
      const backupInput = input.value;
      input.disabled = true;
      input.style.cursor = "not-allowed";
      input.value = "asking AI...";
      if (userInput.length > 0) {
        input.style.cursor = "default";
        // Check if the user wants to use BingChat or OpenAI's GPT
        // Use OpenAI's GPT
        fetchFreeGPTResponse(userInput, (chunk) => {
          const targetId = popup.getAttribute("data-target-id");
          const targetElement = document.getElementById(targetId);
          input.value = "AI is thinking";
          if (chunk === "Sorry, something went wrong") {
            input.value = backupInput;
            input.disabled = false;
            gptResult.textContent += chunk;
            return;
          }
          if (input.id === "ASK") {
            gptResult.textContent += chunk;
          } else {
            if (targetElement) {
              console.log("Element found");
              if (
                (targetElement.tagName === "INPUT" ||
                  targetElement.tagName === "TEXTAREA") &&
                targetElement
              ) {
                targetElement.value += chunk;
              } else if (
                targetElement.getAttribute("contenteditable") === "true"
              ) {
                targetElement.innerHTML += chunk;
              }
            } else {
              const targetClass = popup.getAttribute("data-target-class");
              const targetElements = document.getElementsByClassName(targetClass);
              if (targetElements.length > 0) {
                if (
                  (targetElements[0].tagName === "INPUT" ||
                    targetElements[0].tagName === "TEXTAREA") &&
                  targetElements[0]
                ) {
                  targetElements[0].value += chunk;
                } else if (
                  targetElements[0].getAttribute("contenteditable") === "true"
                ) {
                  targetElements[0].innerHTML += chunk;
                }
              }
            }
          }

          input.value = "";
          input.disabled = false;
          input.style.cursor = "default";
          ttsReady = true;
        });
      }
    }
  });

 

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {

    if (request.action === "createYoutubeSummaryButton") {
      
      console.log("createYoutubeSummaryButton called");
      let url = window.location.href;
      const url2 = new URL(url);
      const isYouTubeVideo =url2.hostname.includes("youtube") && url2.pathname.includes("watch");
      if (isYouTubeVideo) {
        waitForElm("#actions.item.style-scope.ytd-watch-metadata").then(
          (elm) => {
            console.log("Element is ready");
      
            const actionbar = document.querySelector(
              "#actions.item.style-scope.ytd-watch-metadata"
            );
      
            // Check if the button already exists
            if (actionbar.querySelector("#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer")) {
              const toplevel = actionbar.querySelector("#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer")
              if (!toplevel.querySelector("#youtubeButton")) {
                const ytButton = document.createElement("button");
                ytButton.id = "youtubeButton";
                ytButton.classList.add("yt-button");
                ytButton.innerText = "Summarize";
                
                const tooltip = document.createElement("tp-yt-paper-tooltip");
                tooltip.id = "tooltip";
                tooltip.className = "hidden";
                tooltip.setAttribute("style-target", "tooltip"); // Here is the custom attribute
                tooltip.innerText = "Summarize this video with GPT-OTG";
                
                ytButton.appendChild(tooltip);
                
                toplevel.prepend(ytButton);
                
                console.log("youtube button appended");
              
                ytButton.addEventListener("mouseenter", () => {
                  tooltip.classList.remove("hidden");
                });
                
                ytButton.addEventListener("mouseleave", () => {
                  tooltip.classList.add("hidden");
                });
                
                ytButton.addEventListener("click", async () => {
                  await AutoProcessVideo();
                });
              }
            }
            
            
          }
        );
       
      } else {
        console.log("not youtube");
      }
      
    }

    if (request.action === "googleSearch") {
      const googleButton = document.createElement("button");
      googleButton.id = "google-button";
      googleButton.textContent = "Ask GPT-OTG";
      googleButton.classList.add("unNqGf");
      googleButton.classList.add("zItAnd");
      googleButton.classList.add("FOU1zf");

      waitForElm(".nfdoRb").then((elm) => {
        console.log("Element is ready");
        const filter = document.querySelectorAll(".nfdoRb");
        filter[1].append(googleButton);
        console.log("google button appended");
      });
      googleButton.addEventListener("click", () => {
        const sidebar = document.querySelector("#rhs");
        console.log("finding sidebar");
        const query = request.query;
        if (sidebar) {
          console.log("google sidebar found");
          const infoDiv = document.createElement("div");
          infoDiv.textContent = query;
          const input = document.querySelector(".popup-input");
          const popup = document.getElementById("input-focus-popup");
          const gptResult = document.querySelector("#popup-gpt-result");
          const selectedPrompt =
            "In a single sentence, provide key information about: " + query;

          // Call fetchFreeGPTResponse to generate summary
          fetchFreeGPTResponse(selectedPrompt, (chunk) => {
            if (chunk === "Sorry, something went wrong") {
              gptResult.textContent += chunk;
              return;
            }

            gptResult.textContent += chunk;
            
          });

          // Now show the popup
          ttsReady = true;
          showPopup(popup, null, input);
          popup.style.position = "relative";

          sidebar.prepend(popup);
        } else {
          const mainbar = document.querySelector("#rso");
          console.log("finding mainbar");
          const query = request.query;
          if (mainbar) {
            console.log("google mainbar found");
            const infoDiv = document.createElement("div");
            infoDiv.textContent = query;
            const input = document.querySelector(".popup-input");
            const popup = document.getElementById("input-focus-popup");
            const gptResult = document.querySelector("#popup-gpt-result");
            const selectedPrompt =
              "In a single sentence, provide key information about: " + query;

            // Call fetchFreeGPTResponse to generate summary
            fetchFreeGPTResponse(selectedPrompt, (chunk) => {
              if (chunk === "Sorry, something went wrong") {
                gptResult.textContent += chunk;
                return;
              }

              gptResult.textContent += chunk;
              
              
            });

            // Now show the popup
            ttsReady = true;
            showPopup(popup, null, input);
            popup.style.position = "relative";

            mainbar.prepend(popup);
          }
        }
      });
    }

    if (request.text === "getMousePosition") {
      sendResponse(lastMousePosition);
    }

    if (request.action === "displayThankYouPage") {
      //change the classname "installed" to "block", the classname "not-installed" to "none"
      const installed = document.querySelector(".installed");
      const notInstalled = document.querySelector(".not-installed");
      installed.style.display = "block";
      notInstalled.style.display = "none";
      
    }

    if (request.text === "summarize") {
      // Get the selected text from the request
      const mousePosition = request.mousePosition;

      console.log(mousePosition.x);
      console.log(mousePosition.y);

      const selectedText = request.selectionText;
      if (selectedText) {
        // Show the popup and set the input value to the selected text
        const input = document.querySelector(".popup-input");
        const popup = document.getElementById("input-focus-popup");
        const gptResult = popup.querySelector("#popup-gpt-result");
        const selectedPrompt =
          "Provide one or two paragraph summary of the following paragraph: " +
          selectedText;
        gptResult.textContent = "";
        // Call fetchFreeGPTResponse to generate summary
        fetchFreeGPTResponse(selectedPrompt, (chunk) => {
          if (chunk === "Sorry, something went wrong") {
            gptResult.textContent += chunk;
            return;
          }

          gptResult.textContent += chunk;
          
          
        });

        // Now show the popup
        ttsReady = true;
        showPopup(popup, null, input, { x: mousePosition.x, y: mousePosition.y });
      }
    }
    if (request.text === "chat") {
      //get mouse position
      const mousePosition = request.mousePosition;

      console.log(mousePosition.x);
      console.log(mousePosition.y);

      // Show the popup and set the input value to the selected text
      const input = document.querySelector(".popup-input");
      const popup = document.getElementById("input-focus-popup");
      const gptResult = popup.querySelector("#popup-gpt-result");
      gptResult.textContent = "";
      // Now show the popup
      ttsReady = true;
      input.id = "ASK";
      showPopup(popup, null, input, { x: mousePosition.x, y: mousePosition.y });
    }

    if (request.text === "explain") {
      // Get the selected text from the request
      const mousePosition = request.mousePosition;

      console.log(mousePosition.x);
      console.log(mousePosition.y);


      // Get the selected text from the request
      const selectedText = request.selectionText;
      if (selectedText) {
        // Show the popup and set the input value to the selected text
        const input = document.querySelector(".popup-input");
        const popup = document.getElementById("input-focus-popup");
        const gptResult = popup.querySelector("#popup-gpt-result");
        gptResult.textContent = "";
        const selectedPrompt =
          "Complete explain the following paragraph in  sentences : '" +
          selectedText +
          "'";

        // Call fetchFreeGPTResponse to generate summary
        fetchFreeGPTResponse(selectedPrompt, (chunk) => {
          if (chunk === "Sorry, something went wrong") {
            gptResult.textContent += chunk;
            return;
          }

          gptResult.textContent += chunk;


        });
        ttsReady = true;
        showPopup(popup, null, input, { x: mousePosition.x, y: mousePosition.y });
      }
    }

    if (request.text === "analyzeImage") {
      const mousePosition = request.mousePosition || { x: 0, y: 0 };
      const popup = document.getElementById("input-focus-popup") || createPopup();
      const input = popup.querySelector(".popup-input");
      const gptResult = popup.querySelector("#popup-gpt-result");

      gptResult.textContent = "Analyzing image…";
      ttsReady = false;
      showPopup(popup, null, input, { x: mousePosition.x, y: mousePosition.y });

      try {
        const imageParts = await fetchImageInlineParts(request.imageUrl);
        gptResult.textContent = "";
        await fetchFreeGPTResponse(
          "Describe this image in detail, highlighting subjects, colors, emotions, and potential context.",
          (chunk) => {
            if (chunk) {
              gptResult.textContent += chunk;
            }
          },
          { imageParts }
        );
        ttsReady = true;
      } catch (error) {
        console.error("Image analysis failed", error);
        const errorMessage =
          error?.message?.replace(/^Error:\s*/, "") ||
          "Unable to analyze this image. Try a different image or enable a Gemini model.";
        gptResult.textContent = errorMessage;
      }
    }
  });

  function ToggleInternetButton() {
    const internetMode = localStorage.getItem("gptinternet");
    if (internetMode === "true") {
      localStorage.setItem("gptinternet", "false");
      internetButton.classList.remove("enabled");
    } else {
      localStorage.setItem("gptinternet", "true");
      internetButton.classList.add("enabled");
    }
  }

 

  async function AutoProcessVideo() {
  
    hidePopup(popup, input, gptResult);
    let url = window.location.href;
    const url2 = new URL(url);
    const videoId = url2.searchParams.get('v');
    console.log("Checking if popupShown..");
    const uiPopup = await chrome.storage.session.get(["popupShown"]);
    if (uiPopup.popupShown === false) {
      console.log("processing video with id: " + videoId);
      let transcriptText = "";
      let author = "";
      let title = "";
      const input = document.querySelector(".popup-input");
      const popup = document.getElementById("input-focus-popup");
      const gptResult = document.querySelector("#popup-gpt-result");
  
      try {
        let response = await fetch(
          `https://yooutube-transcript-api.vercel.app/${videoId}`
        );
        transcriptText = await response.text();
      } catch (error) {
        console.log("error getting transcript");
      }
  
      try {
        let params = new URLSearchParams({
          format: "json",
          url: `https://www.youtube.com/watch?v=${videoId}`,
        });
  
        let url = "https://www.youtube.com/oembed?" + params;
        response = await fetch(url);
        let data = await response.json();
        title = data.title;
        author = data.author_name;
      } catch (error) {
        console.log("error getting title");
      }
  
      const prompt = `Summarize the Youtube video based on the title of the video : ${title}, the youtube channel called : ${author} , and the transcript ${transcriptText}. make the summary of it.`;
  
      // Keep checking for the sidebar until it exists
  
      waitForElm("#related.style-scope.ytd-watch-flexy").then(async (elm) => {
        console.log("Element is ready");
        const sidebar = document.querySelector(
          "#related.style-scope.ytd-watch-flexy"
        );
  
        if (sidebar) {
          if (title || author && transcriptText) {
            fetchFreeGPTResponse(prompt, (chunk) => {
              if (chunk === "Sorry, something went wrong") {
                gptResult.textContent += chunk;
                return;
              }
  
              gptResult.textContent += chunk;
              
              
            });
            console.log("fetching completed");
  
            // Now show the popup
            showPopup(popup, null, input);
            popup.style.position = "relative";
            sidebar.prepend(popup);
            console.log("popup yt appended..");
            await chrome.storage.session.set({ popupShown: true }).then(() => {
              console.log("popupShown set to true");
            });
          }
        } else {
          console.log("Youtube sidebar not found, keep checking...");
        }
      });
    } else {
      console.log("popup already shown..");
    }
  }
  

  return popup;
}

function showPopup(popup, target, inputTarget, mousePos) {
  if (target !== null && target !== undefined) {
    const targetRect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    // Calculate the space available at the bottom and top of the screen
    const spaceBottom =
      window.innerHeight - (targetRect.bottom + window.pageYOffset);
    const spaceTop = targetRect.top - window.pageYOffset;

    // Check if the popup would overflow the bottom of the screen
    const wouldOverflowBottom = spaceBottom < popupRect.height;

    // If there's more space at the top or the popup would overflow the bottom
    // then show it on top of the target, otherwise show it at the bottom
    if (wouldOverflowBottom || spaceTop > spaceBottom) {
      popup.style.top = `${
        targetRect.top - popupRect.height + window.pageYOffset
      }px`;
    } else {
      popup.style.top = `${targetRect.bottom + window.pageYOffset}px`;
    }

    popup.style.left = `${targetRect.left}px`;
  }

  if (mousePos !== null && mousePos !== undefined) {
    console.log(mousePos);
    popup.style.top = `${mousePos.y}px`;
    popup.style.left = `${mousePos.x}px`;
  }

  popup.style.opacity = 1;
  popup.style.display = "block";

  if ( inputTarget.id !== null && inputTarget.id !== undefined && inputTarget.id !== "") {
  popup.setAttribute("data-target-id", inputTarget.id);
  } else {
  inputTarget.id = "GPT-OTG-TARGET-ID";
  popup.setAttribute("data-target-id", inputTarget.id);
  }
  if ( inputTarget.classList !== null && inputTarget.classList !== undefined ) {
  popup.setAttribute("data-target-class", inputTarget.classList[0]);
  }

  let internetMode = localStorage.getItem("gptinternet");

  const internetButton = document.querySelector("#internet-button");

  if (internetMode === "true") {
    internetButton.classList.add("enabled"); 
  }else{
    internetButton.classList.remove("enabled")
  }
}

async function hidePopup(popup, input, gptResult) {
  popup.style.display = "none";
  input.value = "";
  gptResult.textContent = "";
  await chrome.storage.session.set({ popupShown: false }).then(() => {
    console.log("popupShown set to false");
  });
}

function isTextInput(element) {
  const isPopupInput = element.classList.contains("popup-input");

  return (
    !isPopupInput &&
    ((element.tagName === "INPUT" && element.type === "text") ||
      element.tagName === "TEXTAREA" ||
      (element.tagName === "DIV" &&
        element.getAttribute("contenteditable") === "true"))
  );
}

const popup = createPopup();

document.addEventListener("click", (event) => {
  const popup = document.getElementById("input-focus-popup");
  const popupWrapper = document.querySelector(".popup-wrapper");
  const input = document.querySelector(".popup-input");
  const gptResult = document.querySelector("#popup-gpt-result");

  // Check if the clicked element is outside the popup
  if (!popupWrapper.contains(event.target)) {
    popup.style.transition = "all 0.5s ease-in-out";
    popup.style.opacity = 0.3;
  } else {
    popup.style.opacity = 1;
    popup.style.transitionDuration = "0s";
  }
});

window.addEventListener("keypress", captureEvent, true);
window.addEventListener("keyup", captureEvent, true);

let lastMousePosition = { x: 0, y: 0 };

document.addEventListener('contextmenu', function(event) {
  lastMousePosition.x = event.clientX;
  lastMousePosition.y = event.clientY;
  console.log('Last mouse position:', lastMousePosition);
});

document.addEventListener("input", (event) => {
  if (isTextInput(event.target) && event.target.tagName !== "DIV") {
    let command = Object.keys(dictCommand).find((key) =>
      event.target.value.trim().endsWith(key)
    );

    if (command) {
      let config = dictCommand[command];
      event.target.value = event.target.value.slice(0, -command.length);

      if (config.mode === "TYPE") {
        // Hide the 'popup-gpt-result' element
        const popupGptResult = document.querySelector("#popup-gpt-result");
        popupGptResult.style.display = "none";
      } else {
        const popupGptResult = document.querySelector("#popup-gpt-result");
        popupGptResult.style.display = "block";
      }
      showPopup(popup, event.target, event.target); // Pass the focused input element
      const popupInput = popup.querySelector(".popup-input");
      popupInput.id = config.mode;
      popupInput.setAttribute("data-service", config.service);
      popupInput.placeholder =
        config.mode === "ASK"
          ? "Hello, May I help you?"
          : "Tell AI to type something!";
      popupInput.focus();
    }
  }
});

function captureEvent(e) {
  if (isTextInput(e.target)) {
    let command = Object.keys(dictCommand).find((key) =>
      e.target.textContent.trim().endsWith(key)
    );

    if (command) {
      let mode = dictCommand[command];
      e.target.textContent = e.target.textContent.slice(0, -command.length);

      showPopup(popup, e.target, e.target); // Pass the focused input element
      const popupInput = popup.querySelector(".popup-input");
      popupInput.id = mode;
      popupInput.placeholder =
        mode === "ai" ? "Hello, May I help you?" : "What should I type?";
      popupInput.focus();
    }
  }
}

//show the popup on the initial page load but set it to display none
document.addEventListener("DOMContentLoaded", function () {
  showPopup(popup, null, null);
  popup.style.display = "none";
});
