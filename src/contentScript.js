//ofc fetch the GPT Response!
let ttsReady = false;

async function fetchFreeGPTResponse(prompt, onChunkReceived) {
  ttsReady = false;
  let url = '';
  let Authorization = '';
  let model = '';
  let tune  = {temp:0.5,top:0.5};
    chrome.storage.sync.get('gptModel', function(items) {
      if (items.gptModel) {
        model = items.gptModel;
      }
      else{
        model = "gpt-3.5-turbo";
      }
    });
  console.log("Currently using model : " + model)
  model == "gpt-3.5-turbo" ? Authorization = "Bearer MyDiscord" : Authorization = "";
  model == "gpt-3.5-turbo" ? url = "https://free.churchless.tech/v1/chat/completions" : url = "";
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    Authorization: Authorization
  };

  let initialPrompt = "";
  try {
    chrome.storage.sync.get('initialPrompt', function(items) {
      initialPrompt = data.initialPrompt;
  });
  } catch (error) {
    initialPrompt = "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked."
  }

  //check if initial prompt is empty, if not use the "You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked.",
  //if empty use the initial prompt from the user
 
  
  const messages = [
    { role: "user", content: prompt },
    { role: "assistant", content: "" },
    {
      role: "system",
      content: initialPrompt,
    },
  ];

  let tuned = {};

  chrome.storage.sync.get('tune', function(items) {
    if (items.tune) {
      if(tune == "balance"){
        tuned.temperature = 0.5;
        tuned.topP = 0.5;
    }else if(tune == "creative"){
        tuned.temperature = 0.1;
        tuned.topP = 0.1;
    }else if(tune == "precise"){
        tuned.temperature = 1;
        tuned.topP = 1;
    }
    }
    else{
      tuned.temperature = 0.5;
        tuned.topP = 0.5;
    }
  });


  const payload = {
    messages: messages,
    model: model,
    temperature: tune.temperature,
    presence_penalty: 0,
    top_p: tune.top_p,
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
    console.log('GPT Model:'+ model)
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
          if (jsonData.trim() !== "[DONE]") { // ignore the [DONE] message
            try {
              const chunkJson = JSON.parse(jsonData);
              const chunkContent = chunkJson.choices[0].delta.content;
              onChunkReceived(chunkContent);
            } catch (e) {
              console.error('Invalid JSON:', e);
            }
          }
        }
      }
    }
  } else {
    onChunkReceived("Sorry, something went wrong");
  }
}
// list dictionary command
const dictCommand = {
  "/ai": {service: 'gpt', mode: "ASK"},
  "/typeai": {service: 'gpt', mode: "TYPE"}
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
  let isDragging = false
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
    chrome.runtime.sendMessage({ message: "open_options_page" });

  
}

// Append the gear button to the popup

const ttsButton = document.createElement("button");
ttsButton.innerHTML = "TTS"; // Or any other label/icon you prefer
ttsButton.classList.add("popup-tts-button"); // Add a CSS class to style the button
popup.appendChild(ttsButton); // Add it next to the gear button
ttsButton.onclick = () => {

  if(ttsReady){
    const gptResult = document.querySelector(".popup-gpt-result");
    const utterance = new SpeechSynthesisUtterance(gptResult.value);
  
    // This function will be called when the list of voices has been populated
    function setVoice() {
      const voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google US English');
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
  gptResult.readOnly = true;


  textareaWrapper.appendChild(gptResult);

  inputWrapper.appendChild(gptResult);

  popup.appendChild(popupWrapper);

  document.body.appendChild(popup);

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        gptResult.value = "";
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
              console.log('Collecting chunk')
              input.value = "AI is thinking";
              if (chunk === "Sorry, something went wrong") {
                  input.value = backupInput;
                  input.disabled = false;
                  gptResult.value += chunk;
                  return;
              }
              if (input.id === 'ASK'){
                gptResult.value += chunk;
                const contentWidth = gptResult.scrollWidth;
                popupWrapper.style.width = `${contentWidth + 20}px`; // Update the width of the popupWrapper
            }else {
                  if (targetElement) {
                      console.log('Element found')
                      
                      if ((targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") && targetElement ) {
                          targetElement.value += chunk;
                      } else if (targetElement.getAttribute("contenteditable") === "true") {
                          targetElement.innerHTML += chunk;
                      }
                  }
              }

        input.value = "";
        input.disabled = false;
        input.style.cursor = "default"; 
        ttsReady = true;
          },);
        }
    }
});


  return popup;
}

function showPopup(popup, target, inputTarget) {
if (target !== null){
  const targetRect = target.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  // Calculate the space available at the bottom and top of the screen
  const spaceBottom = window.innerHeight - (targetRect.bottom + window.pageYOffset);
  const spaceTop = targetRect.top - window.pageYOffset;

  // Check if the popup would overflow the bottom of the screen
  const wouldOverflowBottom = spaceBottom < popupRect.height;

  // If there's more space at the top or the popup would overflow the bottom
  // then show it on top of the target, otherwise show it at the bottom
  if (wouldOverflowBottom || spaceTop > spaceBottom) {
    popup.style.top = `${targetRect.top - popupRect.height + window.pageYOffset}px`;
  } else {
    popup.style.top = `${targetRect.bottom + window.pageYOffset}px`;
  }

  popup.style.left = `${targetRect.left}px`;
}

  popup.style.opacity = 1;
  popup.style.display = "block";
  popup.setAttribute("data-target-id", inputTarget.id);
}


function hidePopup(popup, input, gptResult) {
  popup.style.display = "none";
  input.value = "";
  gptResult.value = "";
  sessionStorage.setItem("popupShown", "false");
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
  const gptResult = document.querySelector(".popup-gpt-result");

  // Check if the clicked element is outside the popup
  if (!popupWrapper.contains(event.target)) {
  popup.style.transition = "all 0.5s ease-in-out";
	popup.style.opacity = 0.3;
  }else{
	  popup.style.opacity = 1;
    popup.style.transitionDuration = "0s";
  }
});

 //thanks to @wOxxOm https://stackoverflow.com/questions/51014426/how-can-i-listen-for-keyboard-events-in-gmail 
window.addEventListener("keypress", captureEvent , true);
window.addEventListener("keyup", captureEvent, true);


document.addEventListener("input", (event) => {
  if (isTextInput(event.target) && event.target.tagName !== "DIV") {
      let command = Object.keys(dictCommand).find(key => event.target.value.trim().endsWith(key));

      if (command) {
          let config = dictCommand[command];
          event.target.value = event.target.value.slice(0, -command.length);
          
        if (config.mode === 'TYPE') {
          // Hide the 'popup-gpt-result' element
          const popupGptResult = document.querySelector('.popup-gpt-result');
          popupGptResult.style.display = 'none';
          console.log('hide popup-gpt-result')
      }else{
          const popupGptResult = document.querySelector('.popup-gpt-result');
          popupGptResult.style.display = 'block';
          console.log('hide popup-gpt-result')
      }
          showPopup(popup, event.target, event.target); // Pass the focused input element
          const popupInput = popup.querySelector(".popup-input");
          popupInput.id = config.mode;
          popupInput.setAttribute('data-service', config.service);
          popupInput.placeholder = (config.mode === 'ASK') ? "Hello, May I help you?" : "Tell AI to type something!";
          popupInput.focus();
      }
  }
});

function captureEvent(e) {
  if (isTextInput(e.target)) {
      let command = Object.keys(dictCommand).find(key => e.target.textContent.trim().endsWith(key));

      if (command) {
          let mode = dictCommand[command];
          e.target.textContent = e.target.textContent.slice(0, -command.length);

          showPopup(popup, e.target, e.target); // Pass the focused input element
          const popupInput = popup.querySelector(".popup-input");
          popupInput.id = mode;
          popupInput.placeholder = (mode === 'ai') ? "Hello, May I help you?" : "What should I type?";
          popupInput.focus();
      }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.text === "summarize") {
    // Get the selected text from the request
    const selectedText = request.selectionText;
    if (selectedText) {
      // Show the popup and set the input value to the selected text
      const input = document.querySelector(".popup-input");
      const popup = document.getElementById("input-focus-popup");
      const gptResult = popup.querySelector(".popup-gpt-result");
      const selectedPrompt = "Provide one or two paragraph summary of the following paragraph: " + selectedText;

      // Call fetchFreeGPTResponse to generate summary
      fetchFreeGPTResponse(selectedPrompt, (chunk) => {
        if (chunk === "Sorry, something went wrong") {
          gptResult.value += chunk;
          return;
        }

        gptResult.value += chunk;
        const contentWidth = gptResult.scrollWidth;
        popup.style.width = `${contentWidth + 20}px`; // Update the width of the popup
      });

        // Now show the popup
        ttsReady = true;
        showPopup(popup, input, input);
    }
  }
});



// Listen for google search event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "googleSearch") {
      // The ID of the sidebar might change, this is just an example
      const sidebar = document.querySelector('#rhs');
      console.log("finding sidebar")
      const query = request.query
      if(sidebar) {
        console.log('google sidebar found')
          const infoDiv = document.createElement('div');
          infoDiv.textContent = query;
          const input = document.querySelector(".popup-input");
          const popup = document.getElementById("input-focus-popup");
          const gptResult = popup.querySelector(".popup-gpt-result");
          const selectedPrompt = "In a single sentence, provide key information about: " + query;
    
          // Call fetchFreeGPTResponse to generate summary
          fetchFreeGPTResponse(selectedPrompt, (chunk) => {
            
            if (chunk === "Sorry, something went wrong") {
              gptResult.value += chunk;
              return;
            }
    
            gptResult.value += chunk;
            const contentWidth = gptResult.scrollWidth;
            popup.style.width = `${contentWidth + 20}px`; // Update the width of the popup
    
          });

            // Now show the popup
          ttsReady = true;
          showPopup(popup, null, input);
          popup.style.position = "relative";

          sidebar.prepend(popup);

      }
  }
});

//youtube get video function
async function processVideo(videoId) {
  let transcriptText = "";
  let author = '';
  let title = '';
  const input = document.querySelector(".popup-input");
  const popup = document.getElementById("input-focus-popup");
  const gptResult = document.querySelector(".popup-gpt-result");
  const sidebar = document.getElementById('related');

  try {
    let response = await fetch(`https://yooutube-transcript-api.vercel.app/${videoId}`)
    transcriptText = await response.text();
  } catch (error) {
    console.log('error getting transcript')
  }

  try {
    let params = new URLSearchParams({
      format: 'json',
      url: `https://www.youtube.com/watch?v=${videoId}`
    });

    let url = "https://www.youtube.com/oembed?" + params;
    response = await fetch(url)
    let data = await response.json()
    title = data.title;
    author = data.author_name;
  } catch (error) {
    console.log('error getting title')
  }

  const prompt = `Summarize the Youtube video based on the title of the video : ${title}, the youtube channel called : ${author} , and the transcript ${transcriptText}. make the summary not too long and not too short.`;

  if (title && author && transcriptText) {

    fetchFreeGPTResponse(prompt, (chunk) => {
      if (chunk === "Sorry, something went wrong") {
        gptResult.value += chunk;
        return;
      }

      gptResult.value += chunk;
      const contentWidth = gptResult.scrollWidth;
      popup.style.width = `${contentWidth + 20}px`;

    });

    // Now show the popup
    showPopup(popup, null, input);
    popup.style.position = "relative";
    sidebar.prepend(popup);
    // Set popupShown to true
    sessionStorage.setItem('popupShown', 'true');
  }
}


// Listen for youtube watch event
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if(request.action === "youtubeWatch") {
    const previousVideoId = sessionStorage.getItem('YtVideoId');
    const popupShown = sessionStorage.getItem('popupShown');
    // If the video id is not the same or the popup is not shown
    if (request.videoId !== previousVideoId || popupShown !== "true") {
      sessionStorage.setItem('YtVideoId', request.videoId);
      await processVideo(request.videoId);
    }
  }
});


//show the popup on the initial page load but set it to display none
document.addEventListener("DOMContentLoaded", function() {
  showPopup(popup, null, null);
  popup.style.display = 'none';
});