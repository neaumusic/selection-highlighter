import React from "react";
import { Options } from "../../options/types";
import { HorizontalLabel, LabelText } from "../Form";

type ScrollMarkersDebounceProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function ScrollMarkersDebounce({
  options,
  setOptions,
}: ScrollMarkersDebounceProps) {
  return (
    <HorizontalLabel>
      <LabelText>Scroll Markers Debounce: </LabelText>
      <input
        type="number"
        min={0}
        max={10000}
        value={options.scrollMarkersDebounce}
        onChange={(e) => {
          setOptions({
            ...options,
            scrollMarkersDebounce: Number(e.currentTarget.value),
          });
        }}
      />
    </HorizontalLabel>
  );
}
