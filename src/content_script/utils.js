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

export async function addStyleElement() {
  const style = document.createElement("style");
  style.textContent = `
    ::highlight(${highlightName()}) {
      ${Object.entries(highlightStyles())
        .map(([styleName, styleValue]) => `${styleName}: ${styleValue};`)
        .join("\n      ")}
    }
    .${scrollMarkersClassName()} {
      height: 2px;
      width: 16px;
      box-sizing: content-box;
      border: 1px solid grey;
      position: fixed;
      right: 0px;
      background-color: yellow;
      z-index: 2147483647;
    }
  `;
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      document.body.appendChild(style);
      resolve();
    });
  });
}

export function addPressedKeysListeners() {
  const pressedKeys = [];
  document.addEventListener("keydown", (e) => {
    const index = pressedKeys.indexOf(e.key);
    if (index === -1) {
      pressedKeys.push(e.key);
    }
  });
  document.addEventListener("keyup", (e) => {
    const index = pressedKeys.indexOf(e.key);
    if (index !== -1) {
      pressedKeys.splice(index, 1);
    }
  });
  window.addEventListener("blur", (e) => {
    pressedKeys.splice(0, pressedKeys.length);
  });
  return pressedKeys;
}
