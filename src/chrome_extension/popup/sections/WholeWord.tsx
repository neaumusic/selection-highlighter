import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel, LabelText } from "../Form";

type WholeWordProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function WholeWord({ options, setOptions }: WholeWordProps) {
  return (
    <HorizontalLabel>
      <LabelText>Whole Word: </LabelText>
      <CheckboxInput
        type="checkbox"
        checked={options.matchWholeWord}
        onChange={(e) => {
          setOptions({
            ...options,
            matchWholeWord: e.currentTarget.checked,
          });
        }}
      />
    </HorizontalLabel>
  );
}
