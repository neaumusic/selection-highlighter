import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel, LabelText } from "../Form";

type ScrollMarkersProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function ScrollMarkers({ options, setOptions }: ScrollMarkersProps) {
  return (
    <HorizontalLabel>
      <LabelText>Scroll Markers: </LabelText>
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
