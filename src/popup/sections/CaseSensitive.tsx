import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel, LabelText } from "../Form";

type CaseSensitiveProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function CaseSensitive({ options, setOptions }: CaseSensitiveProps) {
  return (
    <HorizontalLabel>
      <LabelText>Case Sensitive: </LabelText>
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
