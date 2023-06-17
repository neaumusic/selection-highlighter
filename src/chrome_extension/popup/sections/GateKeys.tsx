import React, { useState } from "react";
import { Options } from "../../options/types";
import { VerticalLabel } from "../Form";
import { usePressedKeys } from "./usePressedKeys";

type GateKeysProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function GateKeys({ options, setOptions }: GateKeysProps) {
  const [isCapturingKeyDown, setIsCapturingKeyDown] = useState(false);
  usePressedKeys(isCapturingKeyDown, options, setOptions);

  return (
    <VerticalLabel>
      <div>
        <span>Gate Keys: </span>
        <button
          type="button"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              e.currentTarget.blur();
              setIsCapturingKeyDown(!isCapturingKeyDown);
            }
          }}
        >
          {!isCapturingKeyDown ? "Record" : "Stop"}
        </button>
      </div>
      <div>{JSON.stringify(options.gateKeys)}</div>
    </VerticalLabel>
  );
}
