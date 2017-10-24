const highlightedSpanTemplate = document.createElement('div');
      highlightedSpanTemplate.className = 'highlighted_selection';

const styles = document.createElement('style');
styles.type = 'text/css';
styles.appendChild(document.createTextNode(`
  .highlighted_selection { display: inline; background-color: yellow; }
`));
document.head.appendChild(styles);

document.addEventListener('selectionchange', onSelectionChange);

function onSelectionChange (e) {
  // ------------------------------------------------------
  //  remove existing
  // ------------------------------------------------------
  document.querySelectorAll('.highlighted_selection').forEach(element => {
    element.parentNode.replaceChild(new Text(element.textContent || ''), element);
  });
  document.normalize();

  // ------------------------------------------------------
  //  get selection and trim newline chars
  // ------------------------------------------------------
  const selection = document.getSelection();
  const match = (selection + '').match(/^(\s*)(\S+(?:\s+\S+)*)(\s*)$/);
  // console.log(selection + '');
  if (!match) return;
  const leadingSpaces = match[1];
  const selectionString = match[2];
  const trailingSpaces = match[3];
  // console.log(
  //   'full match:',match,
  //   'lengths:',leadingSpaces.length, selectionString.length, trailingSpaces.length,
  //   'comparison:',selection.anchorNode.compareDocumentPosition(selection.focusNode),
  //   'anchorOffset:', selection.anchorOffset, 'anchorNode:', selection.anchorNode,
  //   'focusOffset:', selection.focusOffset, 'focusNode:',selection.focusNode
  // );

  // ------------------------------------------------------
  //  validate selection
  // ------------------------------------------------------
  const isSelectionValid = (selectionString.length >= 3 && !/None|Caret/.exec(selection.type));
  if (!isSelectionValid) return;

  // ------------------------------------------------------
  //  get all text nodes
  // ------------------------------------------------------
  const allTextNodes = [];
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  while (treeWalker.nextNode()) {
    allTextNodes.push(treeWalker.currentNode);
  }

  // ------------------------------------------------------
  //  match against all text nodes
  // ------------------------------------------------------
  for (let i = 0; i < allTextNodes.length; i++) {
    const textNode = allTextNodes[i];

    // return if no match
    const matchIndex = textNode.data.indexOf(selectionString);
    if (matchIndex === -1) continue;

    // validate ancestry
    const hasValidAncestry = (
      function isValidAncestor (ancestor) {
        return (
          (!ancestor) ||
          (ancestor.nodeName !== 'SCRIPT') &&
          (ancestor.nodeName !== 'STYLE') &&
          (ancestor.nodeName !== 'HEAD') &&
          (ancestor.nodeName !== 'INPUT') &&
          (ancestor.nodeName !== 'TEXTAREA') &&
          (ancestor.contentEditable !== 'true') &&
          (isValidAncestor(ancestor.parentNode))
        );
      }
    )(textNode.parentNode);
    if (!hasValidAncestry) continue;

    // don't mess with the users' actual selection
    const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    // console.log('textNode',textNode);
    const isTextNodeSelected = (
      (position & Node.DOCUMENT_POSITION_FOLLOWING) ? (
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
      ) : (position & Node.DOCUMENT_POSITION_PRECEDING) ? (
        // offsets are 0 if directly straddling
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
    // console.log('anchor to textnode comparison',selection.anchorNode.compareDocumentPosition(textNode))
    // console.log('textNode === selection.anchorNode:', textNode === selection.anchorNode,
    //   'anchorOffset',selection.anchorOffset, 'matchIndex',matchIndex,'leadingSpaces',leadingSpaces.length
    // );
    // console.log('is user\'s selection?', isTextNodeSelected);

    if (isTextNodeSelected) {
      allTextNodes.push(textNode.splitText(matchIndex + selectionString.length));
      continue;
    }

    // remove excess pre-text and re-queue remaining text
    if (matchIndex !== 0) {
      allTextNodes.push(textNode.splitText(matchIndex));
      continue;
    }

    // wrap the match and re-queue the remaining text
    if (matchIndex === 0) {
      const remaining = textNode.splitText(selectionString.length);
      allTextNodes.push(remaining);
      const highlightedNode = highlightedSpanTemplate.cloneNode(true);
            highlightedNode.appendChild(textNode.cloneNode(true));
      textNode.parentNode.replaceChild(highlightedNode, textNode);
    }
  }

  document.normalize();
};
