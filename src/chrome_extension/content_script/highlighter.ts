import {
  initOptions,
  isSelectionValid,
  isWindowLocationValid,
  areKeysPressed,
  occurrenceRegex,
  isAncestorNodeValid,
  trimRegex,
  highlightName,
  areScrollMarkersEnabled,
  scrollMarkersDebounce,
} from "../options/options";
import {
  isSelectionWithAnchorAndFocusNodes,
  SelectionWithAnchorAndFocusNodes,
} from "./types";
import {
  addPressedKeysListeners,
  addStyleElement,
  addScrollMarkersCanvas,
} from "./utils";

let pressedKeys: string[] = [];
let scrollMarkersCanvasContext: CanvasRenderingContext2D;
(async function () {
  await initOptions();
  await addStyleElement();
  scrollMarkersCanvasContext = await addScrollMarkersCanvas();
  pressedKeys = addPressedKeysListeners();
  document.addEventListener("selectstart", onSelectStart);
  document.addEventListener("selectionchange", onSelectionChange);
})();
/** @ts-ignore this is a new API */
const highlights = new Highlight();
/** @ts-ignore this is a new API */
CSS.highlights.set(highlightName(), highlights);

let isNewSelection = false;
let lastSelectionString: string;
let latestRunNumber = 0;
let drawMarkersTimeout: number;
function onSelectStart() {
  isNewSelection = true;
}
function onSelectionChange() {
  const selectionString = window.getSelection() + "";
  if (!isNewSelection) {
    if (selectionString === lastSelectionString) {
      return;
    }
  }
  isNewSelection = false;
  lastSelectionString = selectionString;
  const runNumber = ++latestRunNumber;

  if (!isWindowLocationValid(window.location)) return;
  if (!areKeysPressed(pressedKeys)) return;

  highlights.clear();
  highlight(runNumber);

  requestAnimationFrame(() => {
    if (runNumber !== latestRunNumber) return;

    scrollMarkersCanvasContext.clearRect(
      0,
      0,
      scrollMarkersCanvasContext.canvas.width,
      scrollMarkersCanvasContext.canvas.height
    );
    clearTimeout(drawMarkersTimeout);
    drawMarkersTimeout = window.setTimeout(() => {
      drawScrollMarkers(runNumber);
    }, scrollMarkersDebounce());
  });
}

function highlight(runNumber: number) {
  const selection = document.getSelection();
  if (!isSelectionWithAnchorAndFocusNodes(selection)) return;

  const trimmedSelection = String(selection).match(trimRegex());
  if (!trimmedSelection) return;

  const leadingSpaces = trimmedSelection[1];
  const selectionString = trimmedSelection[2];
  const trailingSpaces = trimmedSelection[3];
  if (!isSelectionValid(selectionString, selection)) return;

  // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  const regex = occurrenceRegex(
    selectionString.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  );

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );
  let match;
  while (treeWalker.nextNode() && runNumber === latestRunNumber) {
    if (!(treeWalker.currentNode instanceof Text)) continue;
    while ((match = regex.exec(treeWalker.currentNode.data))) {
      highlightOccurrences(selection, treeWalker.currentNode, match);
    }
  }

  function highlightOccurrences(
    selection: SelectionWithAnchorAndFocusNodes,
    textNode: Text,
    match: RegExpExecArray
  ) {
    if (!isAncestorNodeValid(textNode.parentNode)) return;

    const matchIndex = match.index;
    const anchorToFocusDirection = selection.anchorNode.compareDocumentPosition(
      selection.focusNode
    );

    function isSelectionAcrossNodesLeftToRight() {
      return anchorToFocusDirection & Node.DOCUMENT_POSITION_FOLLOWING;
    }

    function isSelectionAcrossNodesRightToLeft() {
      return anchorToFocusDirection & Node.DOCUMENT_POSITION_PRECEDING;
    }

    function isUsersSelection() {
      if (isSelectionAcrossNodesLeftToRight()) {
        if (textNode === selection.anchorNode) {
          return (
            (selection.anchorNode.nodeType === Node.ELEMENT_NODE &&
              selection.anchorOffset === 0) ||
            selection.anchorOffset <= matchIndex - leadingSpaces.length
          );
        } else if (textNode === selection.focusNode) {
          return (
            (selection.focusNode.nodeType === Node.ELEMENT_NODE &&
              selection.focusOffset === 0) ||
            selection.focusOffset >=
              matchIndex + selectionString.length + trailingSpaces.length
          );
        } else {
          return (
            selection.anchorNode.compareDocumentPosition(textNode) &
              Node.DOCUMENT_POSITION_FOLLOWING &&
            selection.focusNode.compareDocumentPosition(textNode) &
              Node.DOCUMENT_POSITION_PRECEDING
          );
        }
      } else if (isSelectionAcrossNodesRightToLeft()) {
        if (textNode === selection.anchorNode) {
          return (
            (selection.anchorNode.nodeType === Node.ELEMENT_NODE &&
              selection.anchorOffset === 0) ||
            selection.anchorOffset >=
              matchIndex + selectionString.length + trailingSpaces.length
          );
        } else if (textNode === selection.focusNode) {
          return (
            (selection.focusNode.nodeType === Node.ELEMENT_NODE &&
              selection.focusOffset === 0) ||
            selection.focusOffset <= matchIndex - leadingSpaces.length
          );
        } else {
          return (
            selection.anchorNode.compareDocumentPosition(textNode) &
              Node.DOCUMENT_POSITION_PRECEDING &&
            selection.focusNode.compareDocumentPosition(textNode) &
              Node.DOCUMENT_POSITION_FOLLOWING
          );
        }
      } else {
        if (selection.anchorOffset < selection.focusOffset) {
          return (
            textNode === selection.anchorNode &&
            selection.anchorOffset <= matchIndex - leadingSpaces.length &&
            selection.focusOffset >=
              matchIndex + selectionString.length + trailingSpaces.length
          );
        } else if (selection.anchorOffset > selection.focusOffset) {
          return (
            textNode === selection.focusNode &&
            selection.focusOffset <= matchIndex - leadingSpaces.length &&
            selection.anchorOffset >=
              matchIndex + selectionString.length + trailingSpaces.length
          );
        }
      }
    }

    if (!isUsersSelection()) {
      const range = new Range();
      range.selectNode(textNode);
      range.setStart(textNode, matchIndex);
      range.setEnd(textNode, matchIndex + selectionString.length);
      highlights.add(range);
    }
  }
}

function drawScrollMarkers(runNumber: number) {
  if (runNumber !== latestRunNumber) return;

  if (areScrollMarkersEnabled()) {
    for (let highlightedNode of highlights) {
      requestAnimationFrame(() => {
        const dpr = devicePixelRatio || 1;
        if (runNumber === latestRunNumber) {
          const clientRect = highlightedNode.getBoundingClientRect();
          if (!clientRect.width || !clientRect.height) return false;

          // window height times percent of element position in document
          const top =
            (window.innerHeight *
              (document.documentElement.scrollTop +
                clientRect.top +
                0.5 * (clientRect.top - clientRect.bottom))) /
            document.documentElement.scrollHeight;

          scrollMarkersCanvasContext.beginPath();
          scrollMarkersCanvasContext.lineWidth = 1 * dpr;
          scrollMarkersCanvasContext.strokeStyle = "grey";
          scrollMarkersCanvasContext.fillStyle = "yellow";
          scrollMarkersCanvasContext.strokeRect(
            0.5 * dpr,
            (top + 0.5) * dpr,
            15 * dpr,
            3 * dpr
          );
          scrollMarkersCanvasContext.fillRect(
            1 * dpr,
            (top + 1) * dpr,
            14 * dpr,
            2 * dpr
          );
        }
      });
    }
  }
}
