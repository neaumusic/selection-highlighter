export interface Options {
  minSelectionString: number;
  denyListedHosts: Array<Location["host"]>;
  gateKeys: Array<KeyboardEvent["key"]>; // 'Meta' CMD, 'Alt' Option
  matchWholeWord: boolean;
  matchCaseSensitive: boolean;
  highlightStylesObject: {
    [styleProperty: string]: string;
  };
  highlightStylesDarkModeObject: {
    [styleProperty: string]: string;
  };
  enableScrollMarkers: boolean;
  scrollMarkersDebounce: number;
}

export function isOptions(options: any): options is Options {
  return (
    typeof options === "object" &&
    isNumber(options.minSelectionString) &&
    options.minSelectionString >= 1 &&
    isStringArray(options.denyListedHosts) &&
    isStringArray(options.gateKeys) &&
    isBoolean(options.matchWholeWord) &&
    isBoolean(options.matchCaseSensitive) &&
    isStyleObject(options.highlightStylesObject) &&
    isStyleObject(options.highlightStylesDarkModeObject) &&
    isBoolean(options.enableScrollMarkers) &&
    isNumber(options.scrollMarkersDebounce)
  );
}

export const defaultOptions: Options = {
  minSelectionString: 1,
  denyListedHosts: ["foo.com", "bar.com"],
  gateKeys: [], // 'Meta' CMD, 'Alt' Option
  matchWholeWord: false,
  matchCaseSensitive: false,
  highlightStylesObject: {
    "background-color": "rgba(255,255,0,1)", // yellow 100%
    color: "rgba(0,0,0,1)", // black 100%
  },
  highlightStylesDarkModeObject: {
    "background-color": "rgba(255,0,255,0.8)", // purple 80%
    color: "rgba(255,255,255,1)", // white 100%
  },
  enableScrollMarkers: true,
  scrollMarkersDebounce: 0,
};

export function backfillOptions(partialOptions: Partial<Options>) {
  const backfilledOptions: Options = { ...defaultOptions };
  if (isNumber(partialOptions.minSelectionString))
    backfilledOptions.minSelectionString = partialOptions.minSelectionString;
  if (isStringArray(partialOptions.denyListedHosts))
    backfilledOptions.denyListedHosts = partialOptions.denyListedHosts;
  if (isStringArray(partialOptions.gateKeys))
    backfilledOptions.gateKeys = partialOptions.gateKeys;
  if (isBoolean(partialOptions.matchWholeWord))
    backfilledOptions.matchWholeWord = partialOptions.matchWholeWord;
  if (isBoolean(partialOptions.matchCaseSensitive))
    backfilledOptions.matchCaseSensitive = partialOptions.matchCaseSensitive;
  if (isStyleObject(partialOptions.highlightStylesObject))
    backfilledOptions.highlightStylesObject =
      partialOptions.highlightStylesObject;
  if (isStyleObject(partialOptions.highlightStylesDarkModeObject))
    backfilledOptions.highlightStylesDarkModeObject =
      partialOptions.highlightStylesDarkModeObject;
  if (isBoolean(partialOptions.enableScrollMarkers))
    backfilledOptions.enableScrollMarkers = partialOptions.enableScrollMarkers;
  if (isNumber(partialOptions.scrollMarkersDebounce))
    backfilledOptions.scrollMarkersDebounce =
      partialOptions.scrollMarkersDebounce;
  return backfilledOptions;
}

export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

export function isStyleObject(
  value: any
): value is { [styleProperty: string]: string } {
  if (typeof value !== "object") return false;
  return Object.entries(value).every(([k, v]) => isString(k) && isString(v));
}
