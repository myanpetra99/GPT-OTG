/*! For license information please see contentScript.js.LICENSE.txt */
(()=>{function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(){"use strict";t=function(){return n};var n={},o=Object.prototype,r=o.hasOwnProperty,i=Object.defineProperty||function(e,t,n){e[t]=n.value},a="function"==typeof Symbol?Symbol:{},s=a.iterator||"@@iterator",u=a.asyncIterator||"@@asyncIterator",c=a.toStringTag||"@@toStringTag";function l(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{l({},"")}catch(e){l=function(e,t,n){return e[t]=n}}function p(e,t,n,o){var r=t&&t.prototype instanceof h?t:h,a=Object.create(r.prototype),s=new q(o||[]);return i(a,"_invoke",{value:E(e,n,s)}),a}function d(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}n.wrap=p;var f={};function h(){}function y(){}function m(){}var g={};l(g,s,(function(){return this}));var v=Object.getPrototypeOf,x=v&&v(v(C([])));x&&x!==o&&r.call(x,s)&&(g=x);var w=m.prototype=h.prototype=Object.create(g);function b(e){["next","throw","return"].forEach((function(t){l(e,t,(function(e){return this._invoke(t,e)}))}))}function S(t,n){function o(i,a,s,u){var c=d(t[i],t,a);if("throw"!==c.type){var l=c.arg,p=l.value;return p&&"object"==e(p)&&r.call(p,"__await")?n.resolve(p.__await).then((function(e){o("next",e,s,u)}),(function(e){o("throw",e,s,u)})):n.resolve(p).then((function(e){l.value=e,s(l)}),(function(e){return o("throw",e,s,u)}))}u(c.arg)}var a;i(this,"_invoke",{value:function(e,t){function r(){return new n((function(n,r){o(e,t,n,r)}))}return a=a?a.then(r,r):r()}})}function E(e,t,n){var o="suspendedStart";return function(r,i){if("executing"===o)throw new Error("Generator is already running");if("completed"===o){if("throw"===r)throw i;return{value:void 0,done:!0}}for(n.method=r,n.arg=i;;){var a=n.delegate;if(a){var s=L(a,n);if(s){if(s===f)continue;return s}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===o)throw o="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o="executing";var u=d(e,t,n);if("normal"===u.type){if(o=n.done?"completed":"suspendedYield",u.arg===f)continue;return{value:u.arg,done:n.done}}"throw"===u.type&&(o="completed",n.method="throw",n.arg=u.arg)}}}function L(e,t){var n=t.method,o=e.iterator[n];if(void 0===o)return t.delegate=null,"throw"===n&&e.iterator.return&&(t.method="return",t.arg=void 0,L(e,t),"throw"===t.method)||"return"!==n&&(t.method="throw",t.arg=new TypeError("The iterator does not provide a '"+n+"' method")),f;var r=d(o,e.iterator,t.arg);if("throw"===r.type)return t.method="throw",t.arg=r.arg,t.delegate=null,f;var i=r.arg;return i?i.done?(t[e.resultName]=i.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=void 0),t.delegate=null,f):i:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,f)}function k(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function T(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function q(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(k,this),this.reset(!0)}function C(e){if(e){var t=e[s];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,o=function t(){for(;++n<e.length;)if(r.call(e,n))return t.value=e[n],t.done=!1,t;return t.value=void 0,t.done=!0,t};return o.next=o}}return{next:O}}function O(){return{value:void 0,done:!0}}return y.prototype=m,i(w,"constructor",{value:m,configurable:!0}),i(m,"constructor",{value:y,configurable:!0}),y.displayName=l(m,c,"GeneratorFunction"),n.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===y||"GeneratorFunction"===(t.displayName||t.name))},n.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,m):(e.__proto__=m,l(e,c,"GeneratorFunction")),e.prototype=Object.create(w),e},n.awrap=function(e){return{__await:e}},b(S.prototype),l(S.prototype,u,(function(){return this})),n.AsyncIterator=S,n.async=function(e,t,o,r,i){void 0===i&&(i=Promise);var a=new S(p(e,t,o,r),i);return n.isGeneratorFunction(t)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},b(w),l(w,c,"Generator"),l(w,s,(function(){return this})),l(w,"toString",(function(){return"[object Generator]"})),n.keys=function(e){var t=Object(e),n=[];for(var o in t)n.push(o);return n.reverse(),function e(){for(;n.length;){var o=n.pop();if(o in t)return e.value=o,e.done=!1,e}return e.done=!0,e}},n.values=C,q.prototype={constructor:q,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(T),!e)for(var t in this)"t"===t.charAt(0)&&r.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function n(n,o){return a.type="throw",a.arg=e,t.next=n,o&&(t.method="next",t.arg=void 0),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return n("end");if(i.tryLoc<=this.prev){var s=r.call(i,"catchLoc"),u=r.call(i,"finallyLoc");if(s&&u){if(this.prev<i.catchLoc)return n(i.catchLoc,!0);if(this.prev<i.finallyLoc)return n(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return n(i.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return n(i.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n];if(o.tryLoc<=this.prev&&r.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?(this.method="next",this.next=i.finallyLoc,f):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),f},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),T(n),f}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var o=n.completion;if("throw"===o.type){var r=o.arg;T(n)}return r}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,n){return this.delegate={iterator:C(e),resultName:t,nextLoc:n},"next"===this.method&&(this.arg=void 0),f}},n}function n(e,t,n,o,r,i,a){try{var s=e[i](a),u=s.value}catch(e){return void n(e)}s.done?t(u):Promise.resolve(u).then(o,r)}function o(e){return function(){var t=this,o=arguments;return new Promise((function(r,i){var a=e.apply(t,o);function s(e){n(a,r,i,s,u,"next",e)}function u(e){n(a,r,i,s,u,"throw",e)}s(void 0)}))}}var r=!1;function i(e,t){return a.apply(this,arguments)}function a(){return(a=o(t().mark((function e(n,o){var a,s,u,c,l,p,d,f,h,y,m,g,v,x,w,b,S,E,L,k,T,q,C,O,P;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return document.querySelector(".popup-suggestion-wrapper").innerHTML="",r=!1,a="",s="",s="gpt-3.5-turbo",console.log("Currently using model : "+s),a="https://free.churchless.tech/v1/chat/completions",u={"Content-Type":"application/json",Accept:"*/*","Referrer-Policy":"strict-origin-when-cross-origin",Authorization:"Bearer MyDiscord"},c=[{role:"user",content:n},{role:"assistant",content:""},{role:"system",content:"You are ChatGPT, a large language model trained by OpenAI. \n      Your role is to provide succinct, relevant responses to user queries. \n      Users may summon you anywhere online by typing '/ai' or '/typeai'. If a user requests you to create content such as posts, captions, emails, or letters, \n      provide only the required text without any leading phrases (e.g., 'Sure, here is...') or concluding remarks. \n      Your response should be focused solely on fulfilling the user's request. Respond using Markdown."}],l={},e.next=14,chrome.storage.sync.get("tune",(function(e){e.tune?"balance"==e.tune?(l.temperature=.5,l.topP=.5):"creative"==e.tune?(l.temperature=.1,l.topP=.1):"precise"==e.tune&&(l.temperature=1,l.topP=1):(l.temperature=1,l.topP=1)}));case 14:return stream=!0,p={messages:c,model:s,temperature:1,presence_penalty:0,top_p:1,frequency_penalty:0,stream},e.next=18,fetch(a,{method:"POST",headers:u,body:JSON.stringify(p),credentials:"omit",mode:"cors"});case 18:if(d=e.sent,!stream){e.next=50;break}if(!d.ok){e.next=47;break}console.log("GPT Model:"+s),f=d.body.getReader(),h=new TextDecoder,y="";case 25:return e.next=28,f.read();case 28:if(m=e.sent,g=m.done,v=m.value,!g){e.next=33;break}return e.abrupt("break",45);case 33:y+=h.decode(v,{stream:!0});case 34:if(-1!==(x=y.indexOf("\n"))){e.next=38;break}return e.abrupt("break",43);case 38:if(w=y.slice(0,x),y=y.slice(x+1),w.startsWith("data: ")&&"[DONE]"!==(b=w.substring(6)).trim())try{S=JSON.parse(b),void 0===(E=S.choices[0].delta.content)&&(E=""),o(E)}catch(e){console.error("Invalid JSON:",e)}e.next=34;break;case 43:e.next=25;break;case 45:e.next=48;break;case 47:o("Sorry, something went wrong");case 48:e.next=61;break;case 50:if(!d.ok){e.next=60;break}return console.log("GPT Model:"+s),e.next=54,d.json();case 54:L=e.sent,void 0===(k=L.choices[0].message.content)&&(k=""),o(k),e.next=61;break;case 60:o("Sorry, something went wrong");case 61:return T=document.querySelector("#popup-gpt-result").textContent,p.stream=!1,p.messages[1].content=T,p.messages[2].content='provide one or more suggestions based on the user prompt and your response.\n  These suggestions should follow this specific format: [{"suggestion": "1", "text": "Your question here"}, {"suggestion": "2", "text": "Your second question here"}]. \n  For instance, if a user asks \'Who is Spiderman?\', you should end your response EXACTLY LIKE THIS: "GPT-SUGGEST: [{"suggestion": "1", text: "How strong is Spiderman?"}, {"suggestion": "2", "text": "Who are some of Spiderman\'s most formidable enemies?"}]". \n  No leading or trailing phrases should be used around these suggestions; they should follow immediately after the answer to the initial query.',e.next=67,fetch(a,{method:"POST",headers:u,body:JSON.stringify(p),credentials:"omit",mode:"cors"});case 67:if(!(q=e.sent).ok){e.next=81;break}return console.log("GPT Model:"+s),e.next=72,q.json();case 72:C=e.sent,void 0===(O=C.choices[0].message.content)&&(O=""),console.log(O),-1!==(P=O.indexOf("GPT-SUGGEST:"))&&(O=O.slice(P+12)),console.log(O),JSON.parse(O).forEach((function(e){var t=document.createElement("button");t.innerHTML=e.text,t.classList.add("suggestion-button"),t.addEventListener("click",(function(){document.querySelector("#popup-gpt-result").textContent="",i(e.text,o)})),document.querySelector(".popup-suggestion-wrapper").appendChild(t)}));case 81:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var s={"/ai":{service:"gpt",mode:"ASK"},"/typeai":{service:"gpt",mode:"TYPE"}};function u(e){return new Promise((function(t){if(document.querySelector(e))return t(document.querySelector(e));var n=new MutationObserver((function(o){document.querySelector(e)&&(t(document.querySelector(e)),n.disconnect())}));n.observe(document.body,{childList:!0,subtree:!0})}))}function c(e,t,n,o){if(null!=t){var r=t.getBoundingClientRect(),i=e.getBoundingClientRect(),a=window.innerHeight-(r.bottom+window.pageYOffset),s=r.top-window.pageYOffset,u=a<i.height;e.style.top="".concat(u||s>a?r.top-i.height+window.pageYOffset:r.bottom+window.pageYOffset,"px"),e.style.left="".concat(r.left,"px")}null!=o&&(console.log(o),e.style.top="".concat(o.y,"px"),e.style.left="".concat(o.x,"px")),e.style.opacity=1,e.style.display="block",null!==n.id&&void 0!==n.id&&""!==n.id||(n.id="GPT-OTG-TARGET-ID"),e.setAttribute("data-target-id",n.id),null!==n.classList&&void 0!==n.classList&&e.setAttribute("data-target-class",n.classList[0])}function l(e,t,n){return p.apply(this,arguments)}function p(){return p=o(t().mark((function e(n,o,r){return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n.style.display="none",o.value="",r.textContent="",e.next=5,chrome.storage.session.set({popupShown:!1}).then((function(){console.log("popupShown set to false")}));case 5:case"end":return e.stop()}}),e)}))),p.apply(this,arguments)}function d(e){return!e.classList.contains("popup-input")&&("INPUT"===e.tagName&&"text"===e.type||"TEXTAREA"===e.tagName||"DIV"===e.tagName&&"true"===e.getAttribute("contenteditable"))}var f=function(){var e=document.createElement("div");e.id="input-focus-popup",e.style.display="none",e.style.position="absolute",e.classList.add("popup-content"),e.style.width="auto",e.style.zIndex="9999";var n=!1,a={x:0,y:0};e.onmousedown=function(e){n=!0,a={x:e.clientX,y:e.clientY}},e.onmouseup=function(){n=!1},e.onmouseleave=function(){n=!1},e.onmousemove=function(t){if(n){var o=t.clientX-a.x,r=t.clientY-a.y,i=e.offsetTop,s=e.offsetLeft;e.style.top="".concat(i+r,"px"),e.style.left="".concat(s+o,"px"),a={x:t.clientX,y:t.clientY}}};var s=document.createElement("button");s.innerHTML="&times;",s.classList.add("popup-close-button"),s.onclick=function(){return l(e,y,x)};var p=document.createElement("button");p.innerHTML="&#9881;",p.classList.add("popup-gear-button"),p.onclick=function(){chrome.runtime.sendMessage({action:"OpenOptionsPage"})};var d=document.createElement("button");d.innerHTML="TTS",d.classList.add("popup-tts-button"),e.appendChild(d),d.onclick=function(){if(r){var e=function(){var e=window.speechSynthesis.getVoices().find((function(e){return"Google US English"===e.name}));e&&(n.voice=e),window.speechSynthesis.speak(n)},t=document.querySelector("#popup-gpt-result"),n=new SpeechSynthesisUtterance(t.textContent);window.speechSynthesis.getVoices().length?e():window.speechSynthesis.onvoiceschanged=e}},e.appendChild(p);var f=document.createElement("div");f.style.display="flex",f.style.flexDirection="column",f.classList.add("popup-input-wrapper");var y=document.createElement("input");y.type="text",y.style.minWidth="100px",y.oninput=function(e){y.style.width=y.value.length+"ch"},y.placeholder="Ask AI!",y.classList.add("popup-input"),y.autocomplete="off",f.appendChild(y);var m=document.createElement("div");m.style.display="flex",m.style.flexDirection="column",m.classList.add("popup-suggestion-wrapper");var g=document.createElement("div");g.classList.add("popup-wrapper"),g.appendChild(s),g.appendChild(f);var v=document.createElement("div");v.classList.add("textarea-container");var x=document.createElement("span");function w(){return b.apply(this,arguments)}function b(){return b=o(t().mark((function n(){var r,a,s,p,d,f,h,m,g,v,w,b,S,E;return t().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return l(e,y,x),r=window.location.href,a=new URL(r),s=a.searchParams.get("v"),console.log("Checking if popupShown.."),n.next=7,chrome.storage.session.get(["popupShown"]);case 7:if(!1!==n.sent.popupShown){n.next=48;break}return console.log("processing video with id: "+s),p="",d="",f="",h=document.querySelector(".popup-input"),m=document.getElementById("input-focus-popup"),g=document.querySelector("#popup-gpt-result"),n.prev=16,n.next=19,fetch("https://yooutube-transcript-api.vercel.app/".concat(s));case 19:return v=n.sent,n.next=22,v.text();case 22:p=n.sent,n.next=28;break;case 25:n.prev=25,n.t0=n.catch(16),console.log("error getting transcript");case 28:return n.prev=28,w=new URLSearchParams({format:"json",url:"https://www.youtube.com/watch?v=".concat(s)}),b="https://www.youtube.com/oembed?"+w,n.next=33,fetch(b);case 33:return response=n.sent,n.next=36,response.json();case 36:S=n.sent,f=S.title,d=S.author_name,n.next=44;break;case 41:n.prev=41,n.t1=n.catch(28),console.log("error getting title");case 44:E="Summarize the Youtube video based on the title of the video : ".concat(f,", the youtube channel called : ").concat(d," , and the transcript ").concat(p,". make the summary of it."),u("#related.style-scope.ytd-watch-flexy").then(function(){var e=o(t().mark((function e(n){var o;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("Element is ready"),!(o=document.querySelector("#related.style-scope.ytd-watch-flexy"))){e.next=14;break}if(!(f||d&&p)){e.next=12;break}return i(E,(function(e){g.textContent+=e})),console.log("fetching completed"),c(m,null,h),m.style.position="relative",o.prepend(m),console.log("popup yt appended.."),e.next=12,chrome.storage.session.set({popupShown:!0}).then((function(){console.log("popupShown set to true")}));case 12:e.next=15;break;case 14:console.log("Youtube sidebar not found, keep checking...");case 15:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),n.next=49;break;case 48:console.log("popup already shown..");case 49:case"end":return n.stop()}}),n,null,[[16,25],[28,41]])}))),b.apply(this,arguments)}return x.setAttribute("id","popup-gpt-result"),x.setAttribute("role","textbox"),x.setAttribute("contenteditable","true"),x.readOnly=!0,v.appendChild(x),f.appendChild(x),f.appendChild(m),e.appendChild(g),document.body.appendChild(e),y.addEventListener("keydown",function(){var n=o(t().mark((function n(o){var a,s;return t().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:"Enter"===o.key&&(o.preventDefault(),x.textContent="",a=y.value.trim(),s=y.value,y.disabled=!0,y.style.cursor="not-allowed",y.value="asking AI...",a.length>0&&(y.style.cursor="default",i(a,(function(t){var n=e.getAttribute("data-target-id"),o=document.getElementById(n);if(y.value="AI is thinking","Sorry, something went wrong"===t)return y.value=s,y.disabled=!1,void(x.textContent+=t);if("ASK"===y.id)x.textContent+=t;else if(o)console.log("Element found"),"INPUT"!==o.tagName&&"TEXTAREA"!==o.tagName||!o?"true"===o.getAttribute("contenteditable")&&(o.innerHTML+=t):o.value+=t;else{var i=e.getAttribute("data-target-class"),a=document.getElementsByClassName(i);a.length>0&&("INPUT"!==a[0].tagName&&"TEXTAREA"!==a[0].tagName||!a[0]?"true"===a[0].getAttribute("contenteditable")&&(a[0].innerHTML+=t):a[0].value+=t)}y.value="",y.disabled=!1,y.style.cursor="default",r=!0}))));case 1:case"end":return t.stop()}}),n)})));return function(e){return n.apply(this,arguments)}}()),chrome.runtime.onMessage.addListener(function(){var e=o(t().mark((function e(n,a,s){var l,p,d,f,y,m,g,v,x,b,S,E,L,k,T,q,C;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:"createYoutubeSummaryButton"===n.action&&(console.log("createYoutubeSummaryButton called"),l=window.location.href,(p=new URL(l)).hostname.includes("youtube")&&p.pathname.includes("watch")?u("#actions.item.style-scope.ytd-watch-metadata").then((function(e){console.log("Element is ready");var n=document.querySelector("#actions.item.style-scope.ytd-watch-metadata");if(n.querySelector("#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer")){var r=n.querySelector("#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer");if(!r.querySelector("#youtubeButton")){var i=document.createElement("button");i.id="youtubeButton",i.classList.add("yt-button"),i.innerText="Summarize";var a=document.createElement("tp-yt-paper-tooltip");a.id="tooltip",a.className="hidden",a.setAttribute("style-target","tooltip"),a.innerText="Summarize this video with GPT-OTG",i.appendChild(a),r.prepend(i),console.log("youtube button appended"),i.addEventListener("mouseenter",(function(){a.classList.remove("hidden")})),i.addEventListener("mouseleave",(function(){a.classList.add("hidden")})),i.addEventListener("click",o(t().mark((function e(){return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,w();case 2:case"end":return e.stop()}}),e)}))))}}})):console.log("not youtube")),"googleSearch"===n.action&&((d=document.createElement("button")).id="google-button",d.textContent="Ask GPT-OTG",d.classList.add("unNqGf"),d.classList.add("zItAnd"),d.classList.add("FOU1zf"),u(".nfdoRb").then((function(e){console.log("Element is ready"),document.querySelectorAll(".nfdoRb")[1].append(d),console.log("google button appended")})),d.addEventListener("click",(function(){var e=document.querySelector("#rhs");console.log("finding sidebar");var t=n.query;if(e){console.log("google sidebar found"),document.createElement("div").textContent=t;var o=document.querySelector(".popup-input"),a=document.getElementById("input-focus-popup"),s=document.querySelector("#popup-gpt-result");i("In a single sentence, provide key information about: "+t,(function(e){s.textContent+=e})),r=!0,c(a,null,o),a.style.position="relative",e.prepend(a)}else{var u=document.querySelector("#rso");console.log("finding mainbar");var l=n.query;if(u){console.log("google mainbar found"),document.createElement("div").textContent=l;var p=document.querySelector(".popup-input"),d=document.getElementById("input-focus-popup"),f=document.querySelector("#popup-gpt-result");i("In a single sentence, provide key information about: "+l,(function(e){f.textContent+=e})),r=!0,c(d,null,p),d.style.position="relative",u.prepend(d)}}}))),"getMousePosition"===n.text&&s(h),"summarize"===n.text&&(f=n.mousePosition,console.log(f.x),console.log(f.y),(y=n.selectionText)&&(m=document.querySelector(".popup-input"),g=document.getElementById("input-focus-popup"),v=g.querySelector("#popup-gpt-result"),x="Provide one or two paragraph summary of the following paragraph: "+y,v.textContent="",i(x,(function(e){v.textContent+=e})),r=!0,c(g,null,m,{x:f.x,y:f.y}))),"chat"===n.text&&(b=n.mousePosition,console.log(b.x),console.log(b.y),S=document.querySelector(".popup-input"),(E=document.getElementById("input-focus-popup")).querySelector("#popup-gpt-result").textContent="",r=!0,S.id="ASK",c(E,null,S,{x:b.x,y:b.y})),"explain"===n.text&&(L=n.mousePosition,console.log(L.x),console.log(L.y),(k=n.selectionText)&&(T=document.querySelector(".popup-input"),q=document.getElementById("input-focus-popup"),(C=q.querySelector("#popup-gpt-result")).textContent="",i("Complete explain the following paragraph in  sentences : '"+k+"'",(function(e){C.textContent+=e})),r=!0,c(q,null,T,{x:L.x,y:L.y})));case 6:case"end":return e.stop()}}),e)})));return function(t,n,o){return e.apply(this,arguments)}}()),e}();document.addEventListener("click",(function(e){var t=document.getElementById("input-focus-popup"),n=document.querySelector(".popup-wrapper");document.querySelector(".popup-input"),document.querySelector("#popup-gpt-result"),n.contains(e.target)?(t.style.opacity=1,t.style.transitionDuration="0s"):(t.style.transition="all 0.5s ease-in-out",t.style.opacity=.3)})),window.addEventListener("keypress",y,!0),window.addEventListener("keyup",y,!0);var h={x:0,y:0};function y(e){if(d(e.target)){var t=Object.keys(s).find((function(t){return e.target.textContent.trim().endsWith(t)}));if(t){var n=s[t];e.target.textContent=e.target.textContent.slice(0,-t.length),c(f,e.target,e.target);var o=f.querySelector(".popup-input");o.id=n,o.placeholder="ai"===n?"Hello, May I help you?":"What should I type?",o.focus()}}}document.addEventListener("contextmenu",(function(e){h.x=e.clientX,h.y=e.clientY,console.log("Last mouse position:",h)})),document.addEventListener("input",(function(e){if(d(e.target)&&"DIV"!==e.target.tagName){var t=Object.keys(s).find((function(t){return e.target.value.trim().endsWith(t)}));if(t){var n=s[t];e.target.value=e.target.value.slice(0,-t.length),"TYPE"===n.mode?document.querySelector("#popup-gpt-result").style.display="none":document.querySelector("#popup-gpt-result").style.display="block",c(f,e.target,e.target);var o=f.querySelector(".popup-input");o.id=n.mode,o.setAttribute("data-service",n.service),o.placeholder="ASK"===n.mode?"Hello, May I help you?":"Tell AI to type something!",o.focus()}}})),document.addEventListener("DOMContentLoaded",(function(){c(f,null,null),f.style.display="none"}))})();