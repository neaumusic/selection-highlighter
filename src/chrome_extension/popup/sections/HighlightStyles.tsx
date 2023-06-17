import React, { useEffect, useState } from "react";
import { defaultOptions, Options } from "../../options/types";
import { TextAreaWithStatus, VerticalLabel } from "../Form";

type HighlightStylesProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function HighlightStyles({ options, setOptions }: HighlightStylesProps) {
  const [highlightStylesString, setHighlightStylesString] = useState(
    JSON.stringify(options.highlightStylesObject)
  );
  useEffect(() => {
    setHighlightStylesString(JSON.stringify(options.highlightStylesObject));
  }, [options.highlightStylesObject]);

  return (
    <VerticalLabel>
      <div>Highlight Styles: </div>
      <TextAreaWithStatus
        autoCorrect="off"
        rows={3}
        value={highlightStylesString}
        placeholder={JSON.stringify(defaultOptions.highlightStylesObject)}
        error={
          highlightStylesString !==
          JSON.stringify(options.highlightStylesObject)
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
