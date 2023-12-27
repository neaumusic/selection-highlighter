import React, { useEffect, useState } from "react";
import { defaultOptions, Options } from "../../options/types";
import { LabelText, TextAreaWithStatus, VerticalLabel } from "../Form";
import { serialize } from "../utils";

type HighlightStylesProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function HighlightStyles({ options, setOptions }: HighlightStylesProps) {
  const [highlightStylesString, setHighlightStylesString] = useState(
    serialize(options.highlightStylesObject)
  );
  useEffect(() => {
    setHighlightStylesString(serialize(options.highlightStylesObject));
  }, [options.highlightStylesObject]);

  return (
    <VerticalLabel>
      <LabelText>Highlight Styles: </LabelText>
      <TextAreaWithStatus
        autoCorrect="off"
        spellCheck="false"
        rows={4}
        value={highlightStylesString}
        placeholder={serialize(defaultOptions.highlightStylesObject)}
        error={
          highlightStylesString !== serialize(options.highlightStylesObject)
        }
        onChange={(e) => {
          setHighlightStylesString(e.currentTarget.value);
          try {
            setOptions({
              ...options,
              highlightStylesObject: JSON.parse(e.currentTarget.value),
            });
          } catch (e) {
            console.log(e);
          }
        }}
      />
    </VerticalLabel>
  );
}
