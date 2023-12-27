import React, { useEffect, useState } from "react";
import { defaultOptions, Options } from "../../options/types";
import { TextAreaWithStatus, VerticalLabel } from "../Form";

type HighlightStylesDarkModeProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function HighlightStylesDarkMode({
  options,
  setOptions,
}: HighlightStylesDarkModeProps) {
  const [highlightStylesDarkModeString, setHighlightStylesDarkModeString] =
    useState(JSON.stringify(options.highlightStylesDarkModeObject));
  useEffect(() => {
    setHighlightStylesDarkModeString(
      JSON.stringify(options.highlightStylesDarkModeObject)
    );
  }, [options.highlightStylesDarkModeObject]);

  return (
    <VerticalLabel>
      <div>Highlight Styles (Dark Mode): </div>
      <TextAreaWithStatus
        autoCorrect="off"
        rows={3}
        value={highlightStylesDarkModeString}
        placeholder={JSON.stringify(
          defaultOptions.highlightStylesDarkModeObject
        )}
        error={
          highlightStylesDarkModeString !==
          JSON.stringify(options.highlightStylesDarkModeObject)
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
