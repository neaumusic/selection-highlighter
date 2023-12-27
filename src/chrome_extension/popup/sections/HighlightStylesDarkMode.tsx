import React, { useEffect, useState } from "react";
import { defaultOptions, Options } from "../../options/types";
import { LabelText, TextAreaWithStatus, VerticalLabel } from "../Form";
import { serialize } from "../utils";

type HighlightStylesDarkModeProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function HighlightStylesDarkMode({
  options,
  setOptions,
}: HighlightStylesDarkModeProps) {
  const [highlightStylesDarkModeString, setHighlightStylesDarkModeString] =
    useState(serialize(options.highlightStylesDarkModeObject));
  useEffect(() => {
    setHighlightStylesDarkModeString(
      serialize(options.highlightStylesDarkModeObject)
    );
  }, [options.highlightStylesDarkModeObject]);

  return (
    <VerticalLabel>
      <LabelText>Highlight Styles (Dark Mode): </LabelText>
      <TextAreaWithStatus
        autoCorrect="off"
        spellCheck="false"
        rows={4}
        value={highlightStylesDarkModeString}
        placeholder={serialize(defaultOptions.highlightStylesDarkModeObject)}
        error={
          highlightStylesDarkModeString !==
          serialize(options.highlightStylesDarkModeObject)
        }
        onChange={(e) => {
          setHighlightStylesDarkModeString(e.currentTarget.value);
          try {
            setOptions({
              ...options,
              highlightStylesDarkModeObject: JSON.parse(e.currentTarget.value),
            });
          } catch (e) {
            console.log(e);
          }
        }}
      />
    </VerticalLabel>
  );
}
