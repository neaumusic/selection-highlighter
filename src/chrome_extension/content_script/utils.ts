import {
  highlightName,
  highlightStyles,
  highlightStylesDarkMode,
  scrollMarkersCanvasClassName,
} from "../options/options";

export async function addStyleElement() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    ::highlight(${highlightName()}) {
      ${Object.entries(highlightStyles())
        .map(([styleName, styleValue]) => `${styleName}: ${styleValue};`)
        .join("\n      ")}
    }
    @media (prefers-color-scheme: dark) {
      ::highlight(${highlightName()}) {
        ${Object.entries(highlightStylesDarkMode())
          .map(([styleName, styleValue]) => `${styleName}: ${styleValue};`)
          .join("\n      ")}
      }
    }
    .${scrollMarkersCanvasClassName()} {
      pointer-events: none;
      position: fixed;
      z-index: 2147483647;
      top: 0;
      right: 0;
      width: 16px;
      height: 100vh;
    }
  `;
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      document.head.appendChild(styleElement);
      resolve();
    });
  });
}

export async function addScrollMarkersCanvas() {
  const scrollMarkersCanvas = document.createElement("canvas");
  scrollMarkersCanvas.className = scrollMarkersCanvasClassName();
  scrollMarkersCanvas.width = 16 * devicePixelRatio || 1;
  scrollMarkersCanvas.height = window.innerHeight * devicePixelRatio || 1;

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      scrollMarkersCanvas.height = window.innerHeight * devicePixelRatio || 1;
    });
  });
  return new Promise<CanvasRenderingContext2D>((resolve) => {
    requestAnimationFrame(() => {
      document.body.appendChild(scrollMarkersCanvas);
      resolve(scrollMarkersCanvas.getContext("2d")!);
    });
  });
}

export function addPressedKeysListeners() {
  const pressedKeys: KeyboardEvent["key"][] = [];
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
