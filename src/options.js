const DEFAULT_SETTINGS = {
  tune: "balance",
  gptModel: "openai-gpt-3.5-turbo",
  youtubeSummary: true,
  aiCommand: true,
  googleSearch: true,
  initialPrompt: `You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user's instructions.
Respond using Markdown and keep answers concise but complete.
When creating content for the user, answer directly without filler phrases.
After answering, provide follow-up ideas prefixed with \"GPT-SUGGEST:\" in JSON format.`,
  geminiApiKey: "",
};

const MODEL_METADATA = {
  "openai-gpt-3.5-turbo": {
    requiresKey: false,
    hint: "Community maintained endpoint. Great for quick replies.",
  },
  "gemini-pro": {
    requiresKey: true,
    hint: "Google Gemini Pro for high quality text responses.",
  },
  "gemini-pro-vision": {
    requiresKey: true,
    hint: "Gemini Pro Vision understands both images and text.",
  },
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
  const requiresKey = Boolean(metadata?.requiresKey);

  const modelHint = $("#modelHint");
  const geminiField = $("#geminiKeyField");
  modelHint.textContent = hint;

  if (requiresKey) {
    geminiField.classList.remove("hidden");
    $("#geminiApiKey").setAttribute("required", "required");
  } else {
    geminiField.classList.add("hidden");
    $("#geminiApiKey").removeAttribute("required");
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
    $("#geminiApiKey").value = items.geminiApiKey ?? "";

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
    geminiApiKey: $("#geminiApiKey").value.trim(),
  };

  const metadata = MODEL_METADATA[payload.gptModel];
  if (metadata?.requiresKey && !payload.geminiApiKey) {
    setStatus("Gemini API key is required for the selected model.", "error");
    $("#geminiApiKey").focus();
    return;
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
