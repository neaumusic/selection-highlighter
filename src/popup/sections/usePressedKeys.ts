import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { Options } from "../../options/types";

export function usePressedKeys(
  isCapturingKeyDown: boolean,
  options: Options,
  setOptions: Dispatch<SetStateAction<Options>>
) {
  const { gateKeys } = options;
  const setGateKeys = useCallback(
    (gateKeys: Options["gateKeys"]) => {
      setOptions({
        ...options,
        gateKeys,
      });
    },
    [options]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturingKeyDown) return;
      setGateKeys([...new Set(gateKeys.concat(e.key))]);
    },
    [isCapturingKeyDown, gateKeys]
  );
  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturingKeyDown) return;
      setGateKeys(gateKeys.filter((pressedKey) => pressedKey !== e.key));
    },
    [isCapturingKeyDown, gateKeys]
  );
  const onBlur = useCallback(() => {
    if (!isCapturingKeyDown) return;
    setGateKeys([]);
  }, [isCapturingKeyDown]);

  useEffect(() => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [isCapturingKeyDown, gateKeys]);

  useEffect(() => {
    if (isCapturingKeyDown) setGateKeys([]);
  }, [isCapturingKeyDown]);

  return [gateKeys];
}
