/*! For license information please see background.js.LICENSE.txt */
(()=>{function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(){"use strict";e=function(){return r};var r={},n=Object.prototype,o=n.hasOwnProperty,i=Object.defineProperty||function(t,e,r){t[e]=r.value},a="function"==typeof Symbol?Symbol:{},s=a.iterator||"@@iterator",c=a.asyncIterator||"@@asyncIterator",u=a.toStringTag||"@@toStringTag";function h(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{h({},"")}catch(t){h=function(t,e,r){return t[e]=r}}function l(t,e,r,n){var o=e&&e.prototype instanceof m?e:m,a=Object.create(o.prototype),s=new O(n||[]);return i(a,"_invoke",{value:S(t,r,s)}),a}function f(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}r.wrap=l;var d={};function m(){}function p(){}function y(){}var g={};h(g,s,(function(){return this}));var v=Object.getPrototypeOf,w=v&&v(v(M([])));w&&w!==n&&o.call(w,s)&&(g=w);var b=y.prototype=m.prototype=Object.create(g);function x(t){["next","throw","return"].forEach((function(e){h(t,e,(function(t){return this._invoke(e,t)}))}))}function L(e,r){function n(i,a,s,c){var u=f(e[i],e,a);if("throw"!==u.type){var h=u.arg,l=h.value;return l&&"object"==t(l)&&o.call(l,"__await")?r.resolve(l.__await).then((function(t){n("next",t,s,c)}),(function(t){n("throw",t,s,c)})):r.resolve(l).then((function(t){h.value=t,s(h)}),(function(t){return n("throw",t,s,c)}))}c(u.arg)}var a;i(this,"_invoke",{value:function(t,e){function o(){return new r((function(r,o){n(t,e,r,o)}))}return a=a?a.then(o,o):o()}})}function S(t,e,r){var n="suspendedStart";return function(o,i){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===o)throw i;return{value:void 0,done:!0}}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var s=E(a,r);if(s){if(s===d)continue;return s}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===n)throw n="completed",r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n="executing";var c=f(t,e,r);if("normal"===c.type){if(n=r.done?"completed":"suspendedYield",c.arg===d)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(n="completed",r.method="throw",r.arg=c.arg)}}}function E(t,e){var r=e.method,n=t.iterator[r];if(void 0===n)return e.delegate=null,"throw"===r&&t.iterator.return&&(e.method="return",e.arg=void 0,E(t,e),"throw"===e.method)||"return"!==r&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+r+"' method")),d;var o=f(n,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,d;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,d):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,d)}function T(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function P(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function O(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(T,this),this.reset(!0)}function M(t){if(t){var e=t[s];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,n=function e(){for(;++r<t.length;)if(o.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=void 0,e.done=!0,e};return n.next=n}}return{next:k}}function k(){return{value:void 0,done:!0}}return p.prototype=y,i(b,"constructor",{value:y,configurable:!0}),i(y,"constructor",{value:p,configurable:!0}),p.displayName=h(y,u,"GeneratorFunction"),r.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===p||"GeneratorFunction"===(e.displayName||e.name))},r.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,y):(t.__proto__=y,h(t,u,"GeneratorFunction")),t.prototype=Object.create(b),t},r.awrap=function(t){return{__await:t}},x(L.prototype),h(L.prototype,c,(function(){return this})),r.AsyncIterator=L,r.async=function(t,e,n,o,i){void 0===i&&(i=Promise);var a=new L(l(t,e,n,o),i);return r.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},x(b),h(b,u,"Generator"),h(b,s,(function(){return this})),h(b,"toString",(function(){return"[object Generator]"})),r.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},r.values=M,O.prototype={constructor:O,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(P),!t)for(var e in this)"t"===e.charAt(0)&&o.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(r,n){return a.type="throw",a.arg=t,e.next=r,n&&(e.method="next",e.arg=void 0),!!n}for(var n=this.tryEntries.length-1;n>=0;--n){var i=this.tryEntries[n],a=i.completion;if("root"===i.tryLoc)return r("end");if(i.tryLoc<=this.prev){var s=o.call(i,"catchLoc"),c=o.call(i,"finallyLoc");if(s&&c){if(this.prev<i.catchLoc)return r(i.catchLoc,!0);if(this.prev<i.finallyLoc)return r(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return r(i.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return r(i.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&o.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var i=n;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,d):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),d},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),P(r),d}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;P(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:M(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=void 0),d}},r}function r(t,e,r,n,o,i,a){try{var s=t[i](a),c=s.value}catch(t){return void r(t)}s.done?e(c):Promise.resolve(c).then(n,o)}chrome.action.onClicked.addListener((function(t){chrome.runtime.openOptionsPage()}));var n={tune:"balance",youtubeSummary:!0,aiCommand:!0,googleSearch:!0,initialPrompt:"You are ChatGPT, a large language model trained by OpenAI.\nCarefully heed the user's instructions. \nDon't give Respond too Long or too short,make it summary. \nRespond using Markdown. \nYou are a part of chrome extension now that was made by myanpetra99, that You could be used anywhere around the web just type like '/ai' or '/typeai' to spawn you. \nWhen user tell you to type something or tell to someone or create a post or caption or status or write an email or write a letter about something, just give the straight answer without any extra sentences before the answer like `Sure, here's the...` or like `Sure, I'd be happy to help you write a..` and it can be the other, and don't add anything after the answer, just give straight pure answer about what the user just asked."};chrome.runtime.onInstalled.addListener((function(){chrome.storage.sync.set(n),chrome.contextMenus.create({id:"summarize",title:"Summarize AI",contexts:["selection"]}),chrome.contextMenus.create({id:"summarize",title:"Summarize AI",contexts:["selection"]}),chrome.contextMenus.create({id:"chat",title:"Chat AI"}),chrome.contextMenus.create({id:"explain",title:"What is this?",contexts:["selection"]}),chrome.tabs.create({url:"https://myanpetra99.github.io/GPT-OTG-WEB/#/thankyou"})})),chrome.contextMenus.onClicked.addListener((function(t,e){"summarize"===t.menuItemId&&chrome.tabs.sendMessage(e.id,{text:"getMousePosition"},(function(r){var n=r.x,o=r.y;console.log("This is the mouse position: "+n+" "+o),chrome.tabs.sendMessage(e.id,{text:"summarize",selectionText:t.selectionText,mousePosition:{x:n,y:o}})})),"chat"===t.menuItemId&&chrome.tabs.sendMessage(e.id,{text:"getMousePosition"},(function(t){var r=t.x,n=t.y;console.log("This is the mouse position: "+r+" "+n),chrome.tabs.sendMessage(e.id,{text:"chat",mousePosition:{x:r,y:n}})})),"explain"===t.menuItemId&&chrome.tabs.sendMessage(e.id,{text:"getMousePosition"},(function(r){var n=r.x,o=r.y;console.log("This is the mouse position: "+n+" "+o),chrome.tabs.sendMessage(e.id,{text:"explain",selectionText:t.selectionText,mousePosition:{x:n,y:o}})}))}));var o=null;chrome.webNavigation.onCompleted.addListener((function(t){var e=new URL(t.url);e.hostname.includes("google")&&e.pathname.includes("search")&&chrome.storage.sync.get(n,(function(r){if(r.googleSearch){console.log("This is the Google URL that triggered the listener: "+t.url);var n=e.searchParams.get("q");n!==o?(console.log("This is the Google Search Query that triggered the listener: "+n),o=n,chrome.tabs.sendMessage(t.tabId,{action:"googleSearch",query:n})):(console.log("This is the Google Search Query is same as last query: "+n+" and last query is: "+o),o=null)}})),e.hostname.includes("youtube")&&e.pathname.includes("watch")&&chrome.tabs.sendMessage(t.tabId,{action:"createYoutubeSummaryButton"})})),chrome.tabs.onUpdated.addListener((function(t,e,r){var n=new URL(r.url);n.hostname.includes("youtube")&&n.pathname.includes("watch")?chrome.tabs.query({active:!0,currentWindow:!0},(function(t){var e=t[0];chrome.tabs.sendMessage(e.id,{action:"createYoutubeSummaryButton"})})):console.log("Not sending message to content script, url is not a YT video")})),chrome.runtime.onMessage.addListener(function(){var t,n=(t=e().mark((function t(r){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:"OpenOptionsPage"===r.action&&chrome.runtime.openOptionsPage();case 1:case"end":return t.stop()}}),t)})),function(){var e=this,n=arguments;return new Promise((function(o,i){var a=t.apply(e,n);function s(t){r(a,o,i,s,c,"next",t)}function c(t){r(a,o,i,s,c,"throw",t)}s(void 0)}))});return function(t){return n.apply(this,arguments)}}()),chrome.storage.session.setAccessLevel({accessLevel:"TRUSTED_AND_UNTRUSTED_CONTEXTS"})})();