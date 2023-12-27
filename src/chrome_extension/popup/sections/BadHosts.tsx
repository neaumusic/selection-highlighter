import React, { useEffect, useState } from "react";
import { defaultOptions, Options } from "../../options/types";
import { LabelText, TextAreaWithStatus, VerticalLabel } from "../Form";

type BadHostsProps = {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
};
export function BadHosts({ options, setOptions }: BadHostsProps) {
  const [denyListedHostsString, setDenyListedHostsString] = useState(
    JSON.stringify(options.denyListedHosts)
  );
  useEffect(() => {
    setDenyListedHostsString(JSON.stringify(options.denyListedHosts));
  }, [options.denyListedHosts]);
  return (
    <VerticalLabel>
      <LabelText>Bad Hosts: </LabelText>
      <TextAreaWithStatus
        autoCorrect="off"
        rows={1}
        value={denyListedHostsString}
        placeholder={JSON.stringify(defaultOptions.denyListedHosts)}
        error={
          denyListedHostsString !== JSON.stringify(options.denyListedHosts)
        }
        onChange={(e) => {
          setDenyListedHostsString(e.currentTarget.value);
          try {
            setOptions({
              ...options,
              denyListedHosts: JSON.parse(e.currentTarget.value),
            });
          } catch (e) {
            console.log(e);
          }
        }}
      />
    </VerticalLabel>
  );
}
