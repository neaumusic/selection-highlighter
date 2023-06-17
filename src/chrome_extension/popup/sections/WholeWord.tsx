import React from "react";
import { Options } from "../../options/types";
import { CheckboxInput, HorizontalLabel } from "../Form";

type WholeWordProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function WholeWord({ options, setOptions }: WholeWordProps) {
  return (
    <HorizontalLabel>
      <span>Whole Word: </span>
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
