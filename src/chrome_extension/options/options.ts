import { defaultOptions, isOptions, Options } from "./types";

// -----------------------------------------
//               sync options
// -----------------------------------------
let options: Options = defaultOptions;
export async function initOptions(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.onChanged.removeListener(onChanged);
    chrome.storage.onChanged.addListener(onChanged);
    chrome.storage.sync.get(["options"], (data) => {
      if (isOptions(data.options)) {
        options = data.options;
      } else {
        options = defaultOptions;
      }
      resolve();
    });
  });
}
function onChanged(data: { [key: string]: chrome.storage.StorageChange }) {
  if (isOptions(data.options.newValue)) {
    options = data.options.newValue;
  } else {
    options = defaultOptions;
  }
}

// -----------------------------------------
//                helpers
// -----------------------------------------
export function isSelectionValid(
  selectionString: string,
  selection: Selection
) {
  return (
    selectionString.length >= options.minSelectionString &&
    selection.type !== "None" &&
    selection.type !== "Caret"
  );
}

export function isWindowLocationValid(windowLocation: Location) {
  // no deny listed hosts in window.location.host
  return !options.denyListedHosts.some((denyListedHost) =>
    windowLocation.host.includes(denyListedHost)
  );
}

export function areKeysPressed(pressedKeys: Array<KeyboardEvent["key"]> = []) {
  // no gate keys not pressed
  return !options.gateKeys.some((gateKey) => !pressedKeys.includes(gateKey));
}

/**
 * for matching occurences with whole word and case sensitive options
 */
export function occurrenceRegex(selectionString: string) {
  return new RegExp(
    options.matchWholeWord ? `\\b${selectionString}\\b` : selectionString,
    options.matchCaseSensitive ? "g" : "ig"
  );
}

export function isAncestorNodeValid(ancestorNode: ParentNode | null): boolean {
  return (
    !ancestorNode ||
    (ancestorNode.nodeName !== "SCRIPT" &&
      ancestorNode.nodeName !== "STYLE" &&
      ancestorNode.nodeName !== "HEAD" &&
      ancestorNode.nodeName !== "TITLE" &&
      isAncestorNodeValid(ancestorNode.parentNode))
  );
}

/**
 * leading, selectionString, trailing
 *
 * trim parts maintained for offset analysis
 */
export function trimRegex() {
  return /^(\s*)(\S+(?:\s+\S+)*)(\s*)$/;
}

export function highlightName() {
  return "selection_highlighter_highlighted_selection";
}

export function highlightStyles() {
  return options.highlightStylesObject;
}

export function highlightStylesDarkMode() {
  return options.highlightStylesDarkModeObject;
}

export function areScrollMarkersEnabled() {
  return options.enableScrollMarkers;
}

export function scrollMarkersDebounce() {
  return options.scrollMarkersDebounce;
}

export function scrollMarkersCanvasClassName() {
  return "selection_highlighter_scroll_markers";
}
