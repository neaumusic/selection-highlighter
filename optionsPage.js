
// ------------------------------------------------------
//            see highlighter.js userOptions
// ------------------------------------------------------
const defaultOptions = `({
  highlightedClassName: 'highlighted_selection',
  styles: {
    display: 'inline',
    backgroundColor: 'yellow',
  },
  isWindowLocationValid: function (windowLocation) {
    // eg. return (windowLocation.host.includes('linkedin.com') === false);
    return true;
  },
  areKeysPressed: function (pressedKeys = []) {
    // eg. return (pressedKeys.indexOf('Meta') !== -1) && (pressedKeys.indexOf('Alt') !== -1);
    return true;
  },
  isAncestorNodeValid: (
    function isAncestorNodeValid (ancestorNode) {
      return (
        (!ancestorNode) ||
        // eg. (!ancestorNode.classList || !ancestorNode.classList.contains('CodeMirror')) &&
        (ancestorNode.nodeName !== 'SCRIPT') &&
        (ancestorNode.nodeName !== 'STYLE') &&
        (ancestorNode.nodeName !== 'HEAD') &&
        (ancestorNode.nodeName !== 'INPUT') &&
        (ancestorNode.nodeName !== 'TEXTAREA') &&
        (ancestorNode.contentEditable !== 'true') &&
        (isAncestorNodeValid(ancestorNode.parentNode))
      );
    }
  ),
})`;

const optionsTextArea = document.querySelector('textarea#options-text');

chrome.storage.sync.get('optionsText', e => {
  optionsTextArea.value = (e.optionsText || defaultOptions);
});

document.querySelector('button#submit-button').addEventListener('click', e => {
  chrome.storage.sync.set({ optionsText: optionsTextArea.value, });
});

document.querySelector('button#reset-button').addEventListener('click', e => {
  if (window.confirm('Are you sure?')) {
    chrome.storage.sync.clear(() => window.location.reload());
  }
});
