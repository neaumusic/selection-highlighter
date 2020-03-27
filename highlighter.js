
// ------------------------------------------------------
//             see options.js defaultOptions
// ------------------------------------------------------
const options = ({
  highlightedClassName: 'highlighted_selection',
  styles: {
    display: 'inline',
    backgroundColor: 'yellow',
  },
  isWindowLocationValid: function (windowLocation) {
    const blacklistedHosts = [
      'linkedin.com',
      'collabedit.com',
      'coderpad.io',
      'jsbin.com',
      'plnkr.co',
    ];
    return !blacklistedHosts.includes(windowLocation.host);
  },
  areKeysPressed: function (pressedKeys = []) {
    // return pressedKeys.includes('Meta'); // CMD key
    // return pressedKeys.includes('Alt'); // Option key
    return true;
  },
  occurrenceRegex: function (selectionString) {
    return new RegExp(selectionString, 'i'); // partial word, case insensitive
    // return new RegExp(selectionString); // partial word, case sensitive
    // return new RegExp(`\\b${selectionString}\\b`, 'i'); // whole word, case insensitive
    // return new RegExp(`\\b${selectionString}\\b`); // whole word, case sensitive
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
  trimRegex: function () {
    // leading, selectionString, trailing
    // trim parts maintained for offset analysis
    return /^(\s*)(\S+(?:\s+\S+)*)(\s*)$/;
  },
  isSelectionValid: function ({ selectionString, selection }) {
    return (selectionString.length >= 3 && !/None|Caret/.exec(selection.type));
  },
});

chrome.storage.sync.get('optionsText', e => {
  if (e.optionsText) {
    try {
      const userOptions = eval(e.optionsText);
      Object.entries(userOptions).forEach(([key, value]) => {
        options[key] = value;
      });
    } catch (e) { console.error('Error parsing Selection Highlighter options.\n\n',e); }
  }

  initialize();
});

function initialize () {
  const highlightedSpanTemplate = document.createElement('div');
    highlightedSpanTemplate.className = options.highlightedClassName;
  Object.entries(options.styles).forEach(([styleName, styleValue]) => {
    highlightedSpanTemplate.style[styleName] = styleValue;
  });

  const pressedKeys = [];
  document.addEventListener('keydown', e => {
    const index = pressedKeys.indexOf(e.key);
    if (index === -1) {
      pressedKeys.push(e.key);
    }
  });
  document.addEventListener('keyup', e => {
    const index = pressedKeys.indexOf(e.key);
    if (index !== -1) {
      pressedKeys.splice(index, 1);
    }
  });

  document.addEventListener('selectionchange', onSelectionChange);

  function onSelectionChange (e) {
    if (!options.isWindowLocationValid(window.location)) return;
    if (!options.areKeysPressed(pressedKeys)) return;

    document.querySelectorAll('.' + options.highlightedClassName).forEach(element => {
      const parent = element.parentNode;
      if (parent) {
        parent.replaceChild(new Text(element.textContent || ''), element);
        parent.normalize();
      }
    });

    const selection = document.getSelection();
    const trimmedSelection = String(selection).match(options.trimRegex());
    if (!trimmedSelection) return;

    const leadingSpaces = trimmedSelection[1];
    const selectionString = trimmedSelection[2];
    const trailingSpaces = trimmedSelection[3];
    if (!options.isSelectionValid({ selectionString, selection })) return;

    // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    const occurrenceRegex = options.occurrenceRegex(selectionString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    const allTextNodes = [];
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    while (treeWalker.nextNode()) {
      allTextNodes.push(treeWalker.currentNode);
    }

    for (let i = 0; i < allTextNodes.length; i++) {
      const textNode = allTextNodes[i];
      const parent = textNode.parentNode;

      const highlightedNodes = highlightOccurrences(textNode);
      if (highlightedNodes) {
        if (parent) parent.normalize();
      };
    }

    function highlightOccurrences (textNode) {
      const match = occurrenceRegex.exec(textNode.data);
      if (!match) return;
      if (!options.isAncestorNodeValid(textNode.parentNode)) return;

      const matchIndex = match.index;
      const anchorToFocusDirection = selection.anchorNode.compareDocumentPosition(selection.focusNode);
      const isUsersSelection = (
        (anchorToFocusDirection & Node.DOCUMENT_POSITION_FOLLOWING) ? (
          (textNode === selection.anchorNode && (
            selection.anchorNode.nodeType === Node.ELEMENT_NODE && selection.anchorOffset === 0 ||
            selection.anchorOffset === matchIndex - leadingSpaces.length
          )) || (textNode === selection.focusNode && (
            selection.focusNode.nodeType === Node.ELEMENT_NODE && selection.focusOffset === 0 ||
            selection.focusOffset === matchIndex + selectionString.length + trailingSpaces.length
          )) || (
            (textNode !== selection.anchorNode && textNode !== selection.focusNode) && (
              selection.anchorNode.compareDocumentPosition(textNode) & Node.DOCUMENT_POSITION_FOLLOWING &&
              selection.focusNode.compareDocumentPosition(textNode) & Node.DOCUMENT_POSITION_PRECEDING
            )
          )
        ) : (anchorToFocusDirection & Node.DOCUMENT_POSITION_PRECEDING) ? (
          (textNode === selection.anchorNode && (
            selection.anchorNode.nodeType === Node.ELEMENT_NODE && selection.anchorOffset === 0 ||
            selection.anchorNode.nodeType === Node.TEXT_NODE && selection.anchorOffset === matchIndex + selectionString.length + trailingSpaces.length
          )) || (textNode === selection.focusNode && (
            selection.focusNode.nodeType === Node.ELEMENT_NODE && selection.focusOffset === 0 ||
            selection.focusOffset === matchIndex - leadingSpaces.length
          )) || (
            (textNode !== selection.anchorNode && textNode !== selection.focusNode) && (
              selection.anchorNode.compareDocumentPosition(textNode) & Node.DOCUMENT_POSITION_PRECEDING &&
              selection.focusNode.compareDocumentPosition(textNode) & Node.DOCUMENT_POSITION_FOLLOWING
            )
          )
        ) : (
          (selection.anchorOffset < selection.focusOffset) && (
            (textNode === selection.anchorNode && (
              selection.anchorOffset === matchIndex - leadingSpaces.length
            ))
          ) || (selection.anchorOffset > selection.focusOffset) && (
            (textNode === selection.focusNode && (
              selection.focusOffset === matchIndex - leadingSpaces.length
            ))
          )
        )
      );
      if (!isUsersSelection) {
        const trimmedTextNode = textNode.splitText(matchIndex);
        const remainingTextNode = trimmedTextNode.splitText(selectionString.length);
        const highlightedNode = highlightedSpanTemplate.cloneNode(true);
        highlightedNode.appendChild(trimmedTextNode.cloneNode(true));

        const parent = trimmedTextNode.parentNode;
        if (parent) parent.replaceChild(highlightedNode, trimmedTextNode);

        const otherHighlightedNodes = highlightOccurrences(remainingTextNode) || [];
        return [ highlightedNode ].concat(otherHighlightedNodes);
      } else {
        const clonedNode = textNode.cloneNode();
        const remainingClonedTextNode = clonedNode.splitText(matchIndex + selectionString.length);
        if (occurrenceRegex.exec(remainingClonedTextNode.data))
          return highlightOccurrences(textNode.splitText(matchIndex + selectionString.length));
      }
    }
  };
}
