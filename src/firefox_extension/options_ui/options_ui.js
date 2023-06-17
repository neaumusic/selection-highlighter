import { defaultOptionsText } from "../options/default_options_text";

const optionsTextArea = document.querySelector("textarea#options-text");

chrome.storage.sync.get("optionsText", (e) => {
  optionsTextArea.value = e.optionsText || defaultOptionsText;
});

document
  .querySelector("button#submit-button")
  .addEventListener("click", (e) => {
    chrome.storage.sync.set({ optionsText: optionsTextArea.value });
  });

document.querySelector("button#reset-button").addEventListener("click", (e) => {
  if (window.confirm("Are you sure?")) {
    chrome.storage.sync.clear(() => window.location.reload());
  }
});
