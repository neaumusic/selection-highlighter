import React from "react";
import { Options } from "../../options/types";
import { LabelText, VerticalLabel } from "../Form";

type MinimumLengthProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function MinimumLength({ options, setOptions }: MinimumLengthProps) {
  return (
    <VerticalLabel>
      <div>
        <LabelText>Minimum Length: </LabelText>
        <LabelText>
          {options.minSelectionString} character
          {options.minSelectionString > 1 ? "s" : ""}
        </LabelText>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        name="minSelectionString"
        value={options.minSelectionString}
        onChange={(e) =>
          setOptions({
            ...options,
            minSelectionString: Number(e.currentTarget.value),
          })
        }
      />
    </VerticalLabel>
  );
}
