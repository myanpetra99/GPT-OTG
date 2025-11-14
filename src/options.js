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
After answering, provide follow-up ideas prefixed with \"GPT-SUGGEST:\" in JSON format.`,
  openaiApiKey: "",
  geminiApiKey: "",
  anthropicApiKey: "",
  deepseekApiKey: "",
  customApiUrl: "",
  customApiKey: "",
  customApiModel: "",
  customApiStreaming: false,
};

const MODEL_METADATA = {
  "openai-gpt-4o-mini": {
    requiresKey: true,
    provider: "openai",
    hint: "Fastest OpenAI GPT-4o tier with multimodal support.",
  },
  "openai-gpt-4o": {
    requiresKey: true,
    provider: "openai",
    hint: "Best quality OpenAI GPT-4o responses.",
  },
  "gemini-1.5-flash": {
    requiresKey: true,
    provider: "gemini",
    hint: "Gemini 1.5 Flash supports text + images.",
  },
  "gemini-2.0-flash": {
    requiresKey: true,
    provider: "gemini",
    hint: "Latest Gemini 2.0 Flash experimental model.",
  },
  "anthropic-claude-3-5-sonnet": {
    requiresKey: true,
    provider: "anthropic",
    hint: "Claude 3.5 Sonnet excels at reasoning and structure.",
  },
  "deepseek-chat": {
    requiresKey: true,
    provider: "deepseek",
    hint: "DeepSeek Chat is great for rapid drafts.",
  },
  "deepseek-reasoner": {
    requiresKey: true,
    provider: "deepseek",
    hint: "DeepSeek Reasoner focuses on analytical outputs.",
  },
  "custom-openai": {
    requiresKey: false,
    provider: "custom",
    hint: "Connect to any OpenAI-compatible endpoint (e.g., local Ollama).",
  },
};

const PROVIDER_FIELDS = {
  openai: "openaiApiKey",
  gemini: "geminiApiKey",
  anthropic: "anthropicApiKey",
  deepseek: "deepseekApiKey",
  custom: "customApiKey",
};

let isDirty = false;

function $(selector) {
  return document.querySelector(selector);
}

function setDirty() {
  if (!isDirty) {
    isDirty = true;
    $("#save").disabled = false;
    $("#reset").disabled = false;
  }
}

function clearDirtyState() {
  isDirty = false;
  $("#save").disabled = true;
  $("#reset").disabled = true;
}

function setStatus(message, type = "info") {
  const status = $("#statusMessage");
  status.textContent = message;
  status.dataset.type = type;
}

function updateModelUi(modelId) {
  const metadata = MODEL_METADATA[modelId] || MODEL_METADATA[DEFAULT_SETTINGS.gptModel];
  const hint = metadata?.hint ?? "";
  const provider = metadata?.provider;

  const modelHint = $("#modelHint");
  modelHint.textContent = hint;

  document
    .querySelectorAll('[data-provider-key]')
    .forEach((field) => field.classList.add("hidden"));

  Object.values(PROVIDER_FIELDS).forEach((inputId) => {
    $("#" + inputId).removeAttribute("required");
  });

  if (provider && PROVIDER_FIELDS[provider]) {
    const field = document.querySelector(`[data-provider-key="${provider}"]`);
    if (field) {
      field.classList.remove("hidden");
    }
    const input = $("#" + PROVIDER_FIELDS[provider]);
    if (metadata?.requiresKey && input) {
      input.setAttribute("required", "required");
    }
  }
}

function bindFormEvents() {
  const form = $("#settingsForm");
  form.addEventListener("input", setDirty);
  form.addEventListener("change", (event) => {
    if (event.target.id === "model") {
      updateModelUi(event.target.value);
    }
    setDirty();
  });

  $("#save").addEventListener("click", saveSettings);
  $("#reset").addEventListener("click", resetSettings);
}

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    $("#model").value = items.gptModel;
    $("#tune").value = items.tune;
    $("#aiCommand").checked = Boolean(items.aiCommand);
    $("#googleSearch").checked = Boolean(items.googleSearch);
    $("#youtubeSummary").checked = Boolean(items.youtubeSummary);
    $("#initialPrompt").value = items.initialPrompt;
    $("#openaiApiKey").value = items.openaiApiKey ?? "";
    $("#geminiApiKey").value = items.geminiApiKey ?? "";
    $("#anthropicApiKey").value = items.anthropicApiKey ?? "";
    $("#deepseekApiKey").value = items.deepseekApiKey ?? "";
    $("#customApiUrl").value = items.customApiUrl ?? "";
    $("#customApiModel").value = items.customApiModel ?? "";
    $("#customApiKey").value = items.customApiKey ?? "";
    $("#customApiStreaming").checked = Boolean(
      typeof items.customApiStreaming === "boolean"
        ? items.customApiStreaming
        : DEFAULT_SETTINGS.customApiStreaming
    );

    updateModelUi(items.gptModel);
    clearDirtyState();
    setStatus("Settings loaded");
  });
}

function saveSettings() {
  const payload = {
    gptModel: $("#model").value,
    tune: $("#tune").value,
    aiCommand: $("#aiCommand").checked,
    googleSearch: $("#googleSearch").checked,
    youtubeSummary: $("#youtubeSummary").checked,
    initialPrompt: $("#initialPrompt").value.trim(),
    openaiApiKey: $("#openaiApiKey").value.trim(),
    geminiApiKey: $("#geminiApiKey").value.trim(),
    anthropicApiKey: $("#anthropicApiKey").value.trim(),
    deepseekApiKey: $("#deepseekApiKey").value.trim(),
    customApiUrl: $("#customApiUrl").value.trim(),
    customApiModel: $("#customApiModel").value.trim(),
    customApiKey: $("#customApiKey").value.trim(),
    customApiStreaming: $("#customApiStreaming").checked,
  };

  const metadata = MODEL_METADATA[payload.gptModel];
  if (metadata?.requiresKey) {
    const providerKey = metadata.provider && PROVIDER_FIELDS[metadata.provider];
    if (providerKey && !payload[providerKey]) {
      const friendlyName = metadata.provider
        ? metadata.provider.charAt(0).toUpperCase() + metadata.provider.slice(1)
        : "Selected";
      setStatus(`${friendlyName} API key is required for this model.`, "error");
      $("#" + providerKey)?.focus();
      return;
    }
  }

  if (payload.gptModel === "custom-openai") {
    if (!payload.customApiUrl) {
      setStatus("Custom API URL is required.", "error");
      $("#customApiUrl").focus();
      return;
    }
    if (!payload.customApiModel) {
      setStatus("Enter the model identifier the endpoint expects.", "error");
      $("#customApiModel").focus();
      return;
    }
  }

  chrome.storage.sync.set(payload, () => {
    setStatus("Settings saved successfully.", "success");
    clearDirtyState();
  });
}

function resetSettings() {
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    loadSettings();
    setStatus("Settings restored to defaults.", "success");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindFormEvents();
  loadSettings();
});
