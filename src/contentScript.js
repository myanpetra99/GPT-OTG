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
      const backupInput = input.value;
      input.value = "waiting response from AI...";
      input.disabled = true;
      if (userInput.length > 0) {
        // Pass the callback function to fetchFreeGPTResponse
        fetchFreeGPTResponse(userInput, (chunk) => {
          const targetId = popup.getAttribute("data-target-id");
          const targetElement = document.getElementById(targetId);
          console.log('Ready to input chunk')
          if (chunk === "Sorry, something went wrong") {
            input.value = backupInput;
            input.disabled = false;
            gptResult.value += chunk;
            return;
          }
          if (input.id === 'TYPE'){
            if (targetElement) {
              console.log('Elemement found')
              if ((targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") && targetElement ) {
                targetElement.value += chunk;
              } else if (targetElement.getAttribute("contenteditable") === "true") {
                targetElement.innerHTML += chunk;
              }
            }
            input.value = "";
            input.disabled = false;
          }
          else if (input.id === 'ASK'){
            gptResult.value += chunk;
            const contentWidth = gptResult.scrollWidth;
            popupWrapper.style.width = `${contentWidth + 20}px`; // Update the width of the popupWrapper
            input.value = "";
            input.disabled = false;
          }
        });
      }
    }
  });
  return popup;
}

function showPopup(popup, target, inputTarget) {
  const targetRect = target.getBoundingClientRect();
  popup.style.opacity = 1;
  popup.style.display = "block";
  popup.style.left = `${targetRect.left}px`;
  popup.style.top = `${targetRect.bottom + window.pageYOffset}px`;
  popup.setAttribute("data-target-id", inputTarget.id); 
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

document.addEventListener("click", (event) => {
  const popup = document.getElementById("input-focus-popup");
  const popupWrapper = popup.querySelector(".popup-wrapper");
  const input = popup.querySelector(".popup-input");
  const gptResult = popup.querySelector(".popup-gpt-result");

  // Check if the clicked element is outside the popup
  if (!popupWrapper.contains(event.target)) {
	popup.style.opacity = 0.3;
  }else{
	  popup.style.opacity = 1;
  }
});

 //thanks to @wOxxOm https://stackoverflow.com/questions/51014426/how-can-i-listen-for-keyboard-events-in-gmail 
window.addEventListener("keypress", captureEvent , true);
window.addEventListener("keyup", captureEvent, true);

function captureEvent(e) {
    if (isTextInput(e.target) && e.target.textContent.trim().endsWith("/ai")) {
        e.target.textContent = '' // Remove "/ai" from the input
        mode = 'ASK'
        showPopup(popup, e.target, e.target); // Pass the focused input element
        const popupInput = popup.querySelector(".popup-input");
        popupInput.id = mode
        popupInput.placeholder = "Ask AI anything!";
        popupInput.focus();
    }
    if (isTextInput(e.target) && e.target.textContent.trim().endsWith("/typeai")) {
      e.target.textContent = '' // Remove "/ai" from the input
      mode = 'TYPE'
      showPopup(popup, e.target, e.target); // Pass the focused input element
      const popupInput = popup.querySelector(".popup-input");
      popupInput.id = mode
      popupInput.placeholder = "Tell AI to type something!";
      popupInput.focus();
  }
  }