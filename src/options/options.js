// from chrome.storage
const minSelectionString = 1;
const denyListedHosts = [];
const gateKeys = []; // 'Meta' CMD, 'Alt' Option
const matchWholeWord = false;
const matchCaseSensitive = false;
const highlightStylesObject = {
  "background-color": "rgb(255,255,0,1)", // yellow 100%
  color: "black",
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
    (ancestorNode.nodeName !== "SCRIPT" &&
      ancestorNode.nodeName !== "STYLE" &&
      ancestorNode.nodeName !== "HEAD" &&
      ancestorNode.nodeName !== "TITLE" &&
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
export function scrollMarkersTimeout() {
  return scrollMarkersDebounce;
}
export function scrollMarkersCanvasClassName() {
  return "selection_highlighter_scroll_markers";
}
