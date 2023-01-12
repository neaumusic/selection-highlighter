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
  scrollMarkersClassName,
  scrollMarkerStyles,
} from "../options/options";
import { addPressedKeysListener, addStyleElement } from "./utils";

let pressedKeys = [];
(async function () {
  await fetchOptions();
  await addStyleElement();
  pressedKeys = addPressedKeysListeners();
  document.addEventListener("selectstart", onSelectStart);
  document.addEventListener("selectionchange", onSelectionChange);
})();

const highlights = new Highlight();
CSS.highlights.add(highlightName(), highlights);

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

  requestAnimationFrame(() => {
    removeScrollMarkers();
  });

  requestAnimationFrame(() => {
    highlight(runNumber);
  });
}

function removeScrollMarkers() {
  if (options.areScrollMarkersEnabled()) {
    document
      .querySelectorAll("." + options.scrollMarkerClassName)
      .forEach((element) => {
        document.body.removeChild(element);
      });
  }
}

function highlight(runNumber) {
  const selection = document.getSelection();
  const trimmedSelection = String(selection).match(options.trimRegex());
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
  while (treeWalker.nextNode()) {
    while (((match = regex.exec(treeWalker.currentNode)), regex.lastIndex)) {
      highlightOccurrences(regex);
    }
    highlightOccurrences(treeWalker.currentNode, match);
  }

  // if (areScrollMarkersEnabled()) {
  //   const highlighted = document.querySelectorAll(
  //     "." + options.highlightedClassName
  //   );
  //   const scrollMarkersFragment = document.createDocumentFragment();

  //   for (let i = 0; i < highlighted.length; i++) {
  //     setTimeout(() => {
  //       if (runNumber !== latestRunNumber) return;

  //       const highlightedNode = highlighted[i];
  //       const scrollMarker = document.createElement("div");
  //       scrollMarker.className = options.scrollMarkerClassName;
  //       const scrollMarkerStyles = options.scrollMarkerStyles({
  //         window,
  //         document,
  //         highlightedNode,
  //       });
  //       if (scrollMarkerStyles) {
  //         Object.entries(scrollMarkerStyles).forEach(
  //           ([styleName, styleValue]) => {
  //             scrollMarker.style[styleName] = styleValue;
  //           }
  //         );
  //         scrollMarkersFragment.appendChild(scrollMarker);
  //       }
  //     }, 0);
  //   }

  //   setTimeout(() => {
  //     if (runNumber === latestRunNumber) {
  //       document.body.appendChild(scrollMarkersFragment);
  //     }
  //   }, 0);
  // }

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
      range.setStart(matchIndex);
      range.setEnd(matchIndex + selectionString.length);
      highlights.add(range);
    }
  }
}
