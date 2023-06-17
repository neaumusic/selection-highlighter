export const defaultOptions: Options = {
  minSelectionString: 1,
  denyListedHosts: ["foo.com", "bar.com"],
  gateKeys: [], // 'Meta' CMD, 'Alt' Option
  matchWholeWord: false,
  matchCaseSensitive: false,
  highlightStylesObject: {
    "background-color": "rgba(255,255,0,1)", // yellow 100%
  },
  enableScrollMarkers: true,
  scrollMarkersDebounce: 0,
};

export interface Options {
  minSelectionString: number;
  denyListedHosts: Array<Location["host"]>;
  gateKeys: Array<KeyboardEvent["key"]>; // 'Meta' CMD, 'Alt' Option
  matchWholeWord: boolean;
  matchCaseSensitive: boolean;
  highlightStylesObject: {
    [styleProperty: string]: string;
  };
  enableScrollMarkers: boolean;
  scrollMarkersDebounce: number;
}

export function isOptions(options: any): options is Options {
  if (
    typeof options !== "object" ||
    typeof options.minSelectionString !== "number" ||
    options.minSelectionString < 1 ||
    !Array.isArray(options.denyListedHosts) ||
    options.denyListedHosts.some((h: any) => typeof h !== "string") ||
    !Array.isArray(options.gateKeys) ||
    options.gateKeys.some((g: any) => typeof g !== "string") ||
    typeof options.matchWholeWord !== "boolean" ||
    typeof options.matchCaseSensitive !== "boolean" ||
    typeof options.highlightStylesObject !== "object" ||
    Object.entries(options.highlightStylesObject).some(
      ([k, v]) => typeof k !== "string" || typeof v !== "string"
    ) ||
    typeof options.enableScrollMarkers !== "boolean" ||
    typeof options.scrollMarkersDebounce !== "number"
  ) {
    return false;
  }
  return true;
}
