// from chrome.storage
const minSelectionString = 3;
const denyListedHosts = [
  "linkedin.com",
  "collabedit.com",
  "coderpad.io",
  "jsbin.com",
  "plnkr.co",
  "youtube.com",
  "track.toggl.com",
];
const gateKeys = []; // 'Meta' CMD, 'Alt' Option
const matchWholeWord = false;
const matchCaseSensitive = false;
const highlightStylesObject = {
  "background-color": "rgb(255,255,0,1)", // yellow 100%
};
const enableScrollMarkers = true;

export async function fetchOptions() {
  return Promise.resolve();
}
export function isSelectionValid({ selectionString, selection }) {
  return (
    selectionString.length >= minSelectionString &&
    selection.type !== "None" &&
    selection.type !== "Caret"
  );
}
export function isWindowLocationValid(windowLocation) {
  return !denyListedHosts.some((h) => windowLocation.host.includes(h));
}
export function areKeysPressed(pressedKeys = []) {
  // no gate keys not pressed
  return !gateKeys.some((gateKey) => !pressedKeys.includes(gateKey));
}
export function occurrenceRegex(selectionString) {
  return new RegExp(
    matchWholeWord ? `\b\${selectionString}\b` : selectionString,
    matchCaseSensitive ? "g" : "ig"
  );
}
export function isAncestorNodeValid(ancestorNode) {
  return (
    !ancestorNode ||
    ((!ancestorNode.classList ||
      !ancestorNode.classList.contains("CodeMirror")) &&
      ancestorNode.nodeName !== "SCRIPT" &&
      ancestorNode.nodeName !== "STYLE" &&
      ancestorNode.nodeName !== "HEAD" &&
      ancestorNode.nodeName !== "TITLE" &&
      ancestorNode.nodeName !== "INPUT" &&
      ancestorNode.nodeName !== "TEXTAREA" &&
      ancestorNode.contentEditable !== "true" &&
      isAncestorNodeValid(ancestorNode.parentNode))
  );
}
export function trimRegex() {
  // leading, selectionString, trailing
  // trim parts maintained for offset analysis
  return /^(\s*)(\S+(?:\s+\S+)*)(\s*)$/;
}

export function highlightName() {
  return "selection_highlighter_highlighted_selection";
}

export function highlightStyles() {
  return highlightStylesObject;
}

export function areScrollMarkersEnabled() {
  return enableScrollMarkers;
}

export function scrollMarkersClassName() {
  return "selection_highlighter_scroll_marker";
}

export function scrollMarkerStyles({ window, document, highlightedNode }) {
  const clientRect = highlightedNode.getBoundingClientRect();
  if (!clientRect.width || !clientRect.height) {
    return false;
  }

  return {
    // window height times percent of element position in document
    top:
      (window.innerHeight *
        (window.scrollY +
          clientRect.top +
          0.5 * (clientRect.top - clientRect.bottom))) /
        document.body.clientHeight +
      "px",
  };
}
