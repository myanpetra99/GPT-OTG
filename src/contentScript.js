//ofc fetch the GPT Response!
let ttsReady = false;

async function fetchFreeGPTResponse(prompt, onChunkReceived) {
  document.querySelector(".popup-suggestion-wrapper").innerHTML = "";
  ttsReady = false;
  let url = "";
  let Authorization = "";
  let model = "";
  model = "gpt-3.5-turbo"
  /*wait chrome.storage.sync.get("gptModel", function (items) {
    if (items.gptModel) {
      model = items.gptModel;
    } else {
      model = "gpt-3.5-turbo";
    }
  });*/
  console.log("Currently using model : " + model);
  model == "gpt-3.5-turbo"
    ? (Authorization = "Bearer MyDiscord")
    : (Authorization = "Bearer MyDiscord");
  model == "gpt-3.5-turbo"
    ? (url = "https://free.churchless.tech/v1/chat/completions")
    : (url = "https://free.churchless.tech/v1/chat/completions");

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    Authorization: Authorization,
  };
  
/*
  let initialPrompt = "";
 try {
    await chrome.storage.sync.get("initialPrompt", function (items) {
      initialPrompt = data.initialPrompt;
    });
  } catch (error) {
    initialPrompt ="You are ChatGPT, a large language model trained by OpenAI. Your role is to provide succinct, relevant responses to user queries. At the end of each interaction, offer one or more suggestions for future questions the user might ask. Each suggestion should start with the phrase 'Suggestion: ', followed by the number and the question text.For instance, if a user asks 'Who is Spiderman?', you might suggest: 'Suggestion 1: How strong is Spiderman?' and 'Suggestion 2: Who are some of Spiderman's most formidable enemies?'.Users may summon you anywhere online by typing '/ai' or '/typeai'. If a user requests you to create content such as posts, captions, emails, or letters, provide only the required text without any leading phrases (e.g., 'Sure, here is...') or concluding remarks. Your response should be focused solely on fulfilling the user's request. Please respond using markdown.";
  }*/

  //check if initial prompt is empty, if not use the "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked.",
  //if empty use the initial prompt from the user

  const messages = [
    { role: "user", content: prompt },
    { role: "assistant", content: "" },
    {
      role: "system",
      content: `You are ChatGPT, a large language model trained by OpenAI. 
      Your role is to provide succinct, relevant responses to user queries. 
      Users may summon you anywhere online by typing '/ai' or '/typeai'. If a user requests you to create content such as posts, captions, emails, or letters, 
      provide only the required text without any leading phrases (e.g., 'Sure, here is...') or concluding remarks. 
      Your response should be focused solely on fulfilling the user's request. Respond using Markdown.`
    },
  ];

  let tuned = {};

  await chrome.storage.sync.get("tune", function (items) {
    if (items.tune) {
      if (items.tune == "balance") {
        tuned.temperature = 0.5;
        tuned.topP = 0.5;
      } else if (items.tune == "creative") {
        tuned.temperature = 0.1;
        tuned.topP = 0.1;
      } else if (items.tune == "precise") {
        tuned.temperature = 1;
        tuned.topP = 1;
      }
    } else {
      tuned.temperature = 1;
      tuned.topP = 1;
    }
  });

  stream = true
  
  let payload = {
    messages: messages,
    model: model,
    temperature: 1,
    presence_penalty: 0,
    top_p: 1,
    frequency_penalty: 0,
    stream: stream,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
  });

  if ( stream ) {
    if (response.ok) {
      console.log("GPT Model:" + model);
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
            const jsonData = line.substring(6);
            if (jsonData.trim() !== "[DONE]") {
              try {
                const chunkJson = JSON.parse(jsonData);
                let chunkContent = chunkJson.choices[0].delta.content;
                if (typeof chunkContent === "undefined") {
                  chunkContent = ""; // Set to empty string if content is undefined
                }
                onChunkReceived(chunkContent);
              } catch (e) {
                console.error("Invalid JSON:", e);
              }
            }
          }
        }
      }
    } else {
      onChunkReceived("Sorry, something went wrong");
    }
  } else {
    if (response.ok) {
      console.log("GPT Model:" + model);
      const data = await response.json();
      let chunkContent = data.choices[0].message.content;
      if (typeof chunkContent === "undefined") {
        chunkContent = ""; // Set to empty string if content is undefined
      }
      onChunkReceived(chunkContent);
    } else {
      onChunkReceived("Sorry, something went wrong");
    }
  }

  let gptResult = document.querySelector("#popup-gpt-result").textContent;
  payload.stream = false;
  payload.messages[1].content = gptResult;
  payload.messages[2].content = `provide one or more suggestions based on the user prompt and your response.
  These suggestions should follow this specific format: [{"suggestion": "1", "text": "Your question here"}, {"suggestion": "2", "text": "Your second question here"}]. 
  For instance, if a user asks 'Who is Spiderman?', you should end your response EXACTLY LIKE THIS: "GPT-SUGGEST: [{"suggestion": "1", text: "How strong is Spiderman?"}, {"suggestion": "2", "text": "Who are some of Spiderman's most formidable enemies?"}]". 
  No leading or trailing phrases should be used around these suggestions; they should follow immediately after the answer to the initial query.`;
  
  const responseSuggest = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
  });

//...
if (responseSuggest.ok) {
  console.log("GPT Model:" + model);
  const data = await responseSuggest.json();
  let chunkContent = data.choices[0].message.content;
  if (typeof chunkContent === "undefined") {
    chunkContent = "";
  }
  console.log(chunkContent);

  const suggestIndex = chunkContent.indexOf("GPT-SUGGEST:");
  if (suggestIndex !== -1) {
      chunkContent = chunkContent.slice(suggestIndex + "GPT-SUGGEST:".length);
  }

  console.log(chunkContent);
const suggestions = JSON.parse(chunkContent);
suggestions.forEach((suggestion) => {
  const button = document.createElement("button");
  button.innerHTML = suggestion.text;
  button.classList.add('suggestion-button'); // Add any CSS classes if you want
  button.addEventListener("click", () => {
    document.querySelector("#popup-gpt-result").textContent = "";
    fetchFreeGPTResponse(suggestion.text, onChunkReceived);
  });

  document.querySelector(".popup-suggestion-wrapper").appendChild(button);
});

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

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.classList.add("popup-close-button");
  closeButton.onclick = () => hidePopup(popup, input, gptResult);

  const gearButton = document.createElement("button");
  gearButton.innerHTML = "&#9881;"; // Add gear icon as HTML entity
  gearButton.classList.add("popup-gear-button"); // Add a CSS class to style the button
  gearButton.onclick = () => {
    chrome.runtime.sendMessage({ action: "OpenOptionsPage" });
  };

  // Append the gear button to the popup

  const ttsButton = document.createElement("button");
  ttsButton.innerHTML = "TTS"; // Or any other label/icon you prefer
  ttsButton.classList.add("popup-tts-button"); // Add a CSS class to style the button
  popup.appendChild(ttsButton); // Add it next to the gear button
  ttsButton.onclick = () => {
    if (ttsReady) {
      const gptResult = document.querySelector("#popup-gpt-result");
      const utterance = new SpeechSynthesisUtterance(gptResult.textContent);

      // This function will be called when the list of voices has been populated
      function setVoice() {
        const voice = window.speechSynthesis
          .getVoices()
          .find((voice) => voice.name === "Google US English");
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }

      // If the voices are already loaded, use the desired voice immediately
      if (window.speechSynthesis.getVoices().length) {
        setVoice();
      } else {
        // If the voices are not yet loaded, wait for the voiceschanged event before setting the voice
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
    }
  };

  popup.appendChild(gearButton);

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
  suggestionWrapper.style.display = "flex";
  suggestionWrapper.style.flexDirection = "column";
  suggestionWrapper.classList.add("popup-suggestion-wrapper");

  // Add a wrapper for the popup
  const popupWrapper = document.createElement("div");
  popupWrapper.classList.add("popup-wrapper");

  // Move existing elements into the wrapper
  popupWrapper.appendChild(closeButton);
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
          console.log(chunk);
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
  });

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
  popup.setAttribute("data-target-id", inputTarget.id);
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

//thanks to @wOxxOm https://stackoverflow.com/questions/51014426/how-can-i-listen-for-keyboard-events-in-gmail
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
        console.log("hide popup-gpt-result");
      } else {
        const popupGptResult = document.querySelector("#popup-gpt-result");
        popupGptResult.style.display = "block";
        console.log("hide popup-gpt-result");
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
