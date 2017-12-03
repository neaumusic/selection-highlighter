
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
    // eg. return (windowLocation.host.includes('linkedin.com') === false);
    return true;
  },
  areGateKeysPressed: function (pressedKeys = []) {
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

    if (!options.areGateKeysPressed(pressedKeys)) return;

    // ------------------------------------------------------
    //  remove existing highlights
    // ------------------------------------------------------
    document.querySelectorAll('.' + options.highlightedClassName).forEach(element => {
      const parent = element.parentNode;
      if (parent) {
        parent.replaceChild(new Text(element.textContent || ''), element);
        parent.normalize();
      }
    });

    const selection = document.getSelection();
    const match = (selection + '').match(/^(\s*)(\S+(?:\s+\S+)*)(\s*)$/);
    if (!match) return;
    const leadingSpaces = match[1];
    const selectionString = match[2];
    const trailingSpaces = match[3];

    const isSelectionValid = (selectionString.length >= 3 && !/None|Caret/.exec(selection.type));
    if (!isSelectionValid) return;

    const allTextNodes = [];
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    while (treeWalker.nextNode()) {
      allTextNodes.push(treeWalker.currentNode);
    }

    for (let i = 0; i < allTextNodes.length; i++) {
      const textNode = allTextNodes[i];

      const matchIndex = textNode.data.indexOf(selectionString);
      if (matchIndex === -1) continue;

      const hasValidAncestry = (options.isAncestorNodeValid(textNode.parentNode));
      if (!hasValidAncestry) continue;

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
      if (isUsersSelection) {
        allTextNodes.push(textNode.splitText(matchIndex + selectionString.length));
        continue;
      }

      if (matchIndex !== 0) {
        allTextNodes.push(textNode.splitText(matchIndex));
        continue;

      } else if (matchIndex === 0) {
        const remaining = textNode.splitText(selectionString.length);
        allTextNodes.push(remaining);
        const highlightedNode = highlightedSpanTemplate.cloneNode(true);
              highlightedNode.appendChild(textNode.cloneNode(true));
        const parent = textNode.parentNode;
        if (parent) {
          parent.replaceChild(highlightedNode, textNode);
        }
      }
    }
  };
}
