import styled from "@emotion/styled";
import { useEffect, useReducer, useRef, useState } from "react";
import { defaultOptions, Options, isOptions } from "../options/types";

const s = (value: any) => JSON.stringify(value, null, 2);
const p = (text: string) => JSON.parse(text);

export const Popup = () => {
  const [options, setOptions] = useState(s(defaultOptions));

  useEffect(() => {
    chrome.storage.sync.get("options", (response) => {
      setOptions(s(p(response.options)));
    });
  }, []);

  return (
    <PopupContainer>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const options = p(
              new FormData(e.currentTarget).get("options") as string
            );
            if (isOptions(options)) {
              chrome.storage.sync.set({ options: JSON.stringify(options) });
            } else {
              window.alert("error parsing options, consider resetting");
            }
          } catch (e) {
            window.alert("error parsing options, consider resetting");
          }
        }}
      >
        <FormTextArea
          name="options"
          rows={15}
          value={options}
          onChange={(e) => {
            setOptions(e.target.value);
          }}
        />
        <FormButtons>
          <button type="submit">Submit</button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure?")) {
                setOptions(s(defaultOptions));
                chrome.storage.sync.set({
                  options: JSON.stringify(defaultOptions),
                });
              }
            }}
          >
            Reset
          </button>
        </FormButtons>
      </Form>
    </PopupContainer>
  );
};

const PopupContainer = styled.div`
  width: 400px;
  height: 600px;
  background: lightgrey;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;
const FormTextArea = styled.textarea``;
const FormButtons = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
  column-gap: 1rem;
`;
