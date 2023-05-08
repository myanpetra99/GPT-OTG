//ofc fetch the GPT Response!
async function fetchFreeGPTResponse(prompt, onChunkReceived) {
  const url = "https://free.churchless.tech/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    Referer: "https://bettergpt.chat/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  const messages = [
    { role: "user", content: prompt },
    { role: "assistant", content: "" },
    {
      role: "system",
      content:
        "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nRespond using Markdown.",
    },
  ];

  const payload = {
    messages: messages,
    model: "gpt-3.5-turbo",
    temperature: 1,
    presence_penalty: 0,
    top_p: 1,
    frequency_penalty: 0,
    stream: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
  });

  if (response.ok) {
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
          const chunkJson = JSON.parse(line.substring(6));
          const chunkContent = chunkJson.choices[0].delta.content;
          onChunkReceived(chunkContent); // Call the callback function with the new chunk
        }
      }
    }
  } else {
    onChunkReceived("Sorry, something went wrong");
  }
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

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.classList.add("popup-close-button");
  closeButton.onclick = () => hidePopup(popup, input, gptResult);

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

  inputWrapper.appendChild(input);

  // Add a wrapper for the popup
  const popupWrapper = document.createElement("div");
  popupWrapper.classList.add("popup-wrapper");

  // Move existing elements into the wrapper
  popupWrapper.appendChild(closeButton);
  popupWrapper.appendChild(inputWrapper);

  const textareaWrapper = document.createElement("div");
  textareaWrapper.classList.add("textarea-container");
  

  const gptResult = document.createElement("textarea");
  gptResult.classList.add("popup-gpt-result");
  gptResult.classList.add("half-scroll");
  gptResult.readOnly = true;

  const gradientOverlay = document.createElement("div");
  gradientOverlay.classList.add("gradient-overlay");


  textareaWrapper.appendChild(gptResult);
  textareaWrapper.appendChild(gradientOverlay);

  inputWrapper.appendChild(gptResult);

  popup.appendChild(popupWrapper);

  document.body.appendChild(popup);

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      gptResult.value = "";
      const userInput = input.value.trim();
      input.value = "waiting response from AI...";
      if (userInput.length > 0) {
        // Pass the callback function to fetchFreeGPTResponse
        fetchFreeGPTResponse(userInput, (chunk) => {
          gptResult.value += chunk;
          const contentWidth = gptResult.scrollWidth;
          popupWrapper.style.width = `${contentWidth + 20}px`; // Update the width of the popupWrapper
          input.value = "";
        });
      }
    }
  });
  return popup;
}

function showPopup(popup, target) {
  const targetRect = target.getBoundingClientRect();
  popup.style.display = "block";
  popup.style.left = `${targetRect.left}px`;
  popup.style.top = `${targetRect.bottom + window.pageYOffset}px`;
}

function hidePopup(popup, input, gptResult) {
  popup.style.display = "none";
  input.value = "";
  gptResult.value = "";
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

document.addEventListener("input", (event) => {
  if (isTextInput(event.target) && event.target.value.trim().endsWith("/ai")) {
    event.target.value = event.target.value.trim().slice(0, -3); // Remove "/ai" from the input
    showPopup(popup, event.target);
    const popupInput = popup.querySelector(".popup-input");
    popupInput.focus();
  }
});

/*
  document.addEventListener('focusout', (event) => {
    if (isTextInput(event.target)) {
      hidePopup(popup);
    }
  });
  */
