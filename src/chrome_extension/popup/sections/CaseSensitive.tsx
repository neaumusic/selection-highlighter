import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel } from "../Form";

type CaseSensitiveProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function CaseSensitive({ options, setOptions }: CaseSensitiveProps) {
  return (
    <HorizontalLabel>
      <span>Case Sensitive: </span>
      <CheckboxInput
        type="checkbox"
        checked={options.matchCaseSensitive}
        onChange={(e) => {
          setOptions({
            ...options,
            matchCaseSensitive: e.currentTarget.checked,
          });
        }}
      />
    </HorizontalLabel>
  );
}
