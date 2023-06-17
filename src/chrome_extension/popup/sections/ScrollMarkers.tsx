import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel } from "../Form";

type ScrollMarkersProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function ScrollMarkers({ options, setOptions }: ScrollMarkersProps) {
  return (
    <HorizontalLabel>
      <span>Scroll Markers: </span>
      <CheckboxInput
        type="checkbox"
        checked={options.enableScrollMarkers}
        onChange={(e) => {
          setOptions({
            ...options,
            enableScrollMarkers: e.currentTarget.checked,
          });
        }}
      />
    </HorizontalLabel>
  );
}
