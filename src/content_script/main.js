import {
  fetchOptions,
  isSelectionValid,
  isWindowLocationValid,
  areKeysPressed,
  occurrenceRegex,
  isAncestorNodeValid,
  trimRegex,
  highlightName,
  highlightStyles,
  areScrollMarkersEnabled,
  scrollMarkersTimeout,
  scrollMarkersClassName,
  scrollMarkerStyles,
} from "../options/options";
import { addPressedKeysListeners, addStyleElement } from "./utils";

let pressedKeys = [];
(async function () {
  await fetchOptions();
  await addStyleElement();
  pressedKeys = addPressedKeysListeners();
  document.addEventListener("selectstart", onSelectStart);
  document.addEventListener("selectionchange", onSelectionChange);
})();

const highlights = new Highlight();
CSS.highlights.set(highlightName(), highlights);

let isNewSelection = false;
let lastSelectionString = null;
let latestRunNumber = 0;
function onSelectStart() {
  isNewSelection = true;
}
function onSelectionChange(e) {
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
    removeScrollMarkers(runNumber);
  });

  setTimeout(() => {
    addScrollMarkers(runNumber);
  }, scrollMarkersTimeout);
}

function highlight(runNumber) {
  const selection = document.getSelection();
  const trimmedSelection = String(selection).match(trimRegex());
  if (!trimmedSelection) return;

  const leadingSpaces = trimmedSelection[1];
  const selectionString = trimmedSelection[2];
  const trailingSpaces = trimmedSelection[3];
  if (!isSelectionValid({ selectionString, selection })) return;

  // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  const regex = occurrenceRegex(
    selectionString.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  );

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let match;
  while (treeWalker.nextNode() && runNumber === latestRunNumber) {
    while (
      ((match = regex.exec(treeWalker.currentNode.data)), regex.lastIndex)
    ) {
      highlightOccurrences(treeWalker.currentNode, match);
    }
  }

  function highlightOccurrences(textNode, match) {
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

function removeScrollMarkers(runNumber) {
  if (areScrollMarkersEnabled()) {
    document
      .querySelectorAll("." + scrollMarkersClassName())
      .forEach((element) => {
        requestAnimationFrame(() => {
          if (runNumber === latestRunNumber) {
            element.remove();
          }
        });
      });
  }
}

function addScrollMarkers(runNumber) {
  if (runNumber !== latestRunNumber) return;

  if (areScrollMarkersEnabled()) {
    const scrollMarkersFragment = document.createDocumentFragment();

    for (let highlightedNode of highlights) {
      requestAnimationFrame(() => {
        if (runNumber === latestRunNumber) {
          const scrollMarker = document.createElement("div");
          scrollMarker.className = scrollMarkersClassName();
          const styles = scrollMarkerStyles({
            window,
            document,
            highlightedNode,
          });
          if (styles) {
            Object.entries(styles).forEach(([styleName, styleValue]) => {
              scrollMarker.style[styleName] = styleValue;
            });
            scrollMarkersFragment.appendChild(scrollMarker);
          }
        }
      });
    }

    requestAnimationFrame(() => {
      if (runNumber === latestRunNumber) {
        document.body.appendChild(scrollMarkersFragment);
      }
    });
  }
}
