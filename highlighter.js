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
  const selectionString = (selection + '').trim();

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

    // don't mess wiht the users' actual selection
    const isTextNodeSelected = (
      (selection.anchorNode === textNode && selection.anchorOffset === matchIndex) ||
      (selection.focusNode === textNode && selection.focusOffset === matchIndex)
    );
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
