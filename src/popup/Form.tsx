import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { backfillOptions, defaultOptions, isOptions } from "../options/types";
import { BadHosts } from "./sections/BadHosts";
import { CaseSensitive } from "./sections/CaseSensitive";
import { GateKeys } from "./sections/GateKeys";
import { HighlightStyles } from "./sections/HighlightStyles";
import { HighlightStylesDarkMode } from "./sections/HighlightStylesDarkMode";
import { MinimumLength } from "./sections/MinimumLength";
import { ScrollMarkers } from "./sections/ScrollMarkers";
import { ScrollMarkersDebounce } from "./sections/ScrollMarkersDebounce";
import { WholeWord } from "./sections/WholeWord";

export const Form: React.FC = () => {
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {
    browser.storage.sync.get(["options"]).then((data) => {
      if (isOptions(data.options)) {
        setOptions(data.options);
      } else if (typeof options === "object" && options !== null) {
        setOptions(backfillOptions(options));
      } else {
        setOptions(defaultOptions);
      }
    });
  }, []);

  useEffect(() => {
    if (isOptions(options)) {
      browser.storage.sync.set({ options });
    } else if (typeof options === "object" && options !== null) {
      browser.storage.sync.set({ options: backfillOptions(options) });
    } else {
      browser.storage.sync.set({ options: defaultOptions });
    }
  }, [options]);

  return (
    <FormContainer>
      <WholeWord options={options} setOptions={setOptions} />
      <CaseSensitive options={options} setOptions={setOptions} />
      <MinimumLength options={options} setOptions={setOptions} />
      <GateKeys options={options} setOptions={setOptions} />
      <BadHosts options={options} setOptions={setOptions} />
      <HighlightStyles options={options} setOptions={setOptions} />
      <HighlightStylesDarkMode options={options} setOptions={setOptions} />
      <ScrollMarkers options={options} setOptions={setOptions} />
      <ScrollMarkersDebounce options={options} setOptions={setOptions} />
      <FormButtons>
        <ResetButton type="button" onClick={() => setOptions(defaultOptions)}>
          Reset
        </ResetButton>
        <PaypalLink
          target="_blank"
          href="https://www.paypal.com/donate/?business=L5G6ATNAMJHC4&no_recurring=0&currency_code=USD"
        >
          <button type="button">Paypal</button>
        </PaypalLink>
      </FormButtons>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  width: 400px;
  padding: 1rem;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  background: lightgrey;

  @media (prefers-color-scheme: dark) {
    background-color: rgb(41, 42, 45) !important;
    color: #c8c8c8 !important;
    * {
      background-color: rgb(41, 42, 45) !important;
      color: #c8c8c8 !important;
    }
  }
`;
export const VerticalLabel = styled.label`
  display: flex;
  flex-direction: column;
  white-space: pre;
`;
export const HorizontalLabel = styled.label`
  display: flex;
  align-items: center;
  white-space: pre;
`;
export const LabelText = styled.h4`
  margin: 0;
  display: inline-block;
`;
export const CheckboxInput = styled.input`
  width: 20px;
  height: 20px;
`;
export const TextAreaWithStatus = styled.textarea`
  ${({ error }: { error: boolean }) => error && "border-color: red"};
  ${({ error }: { error: boolean }) => error && "outline-color: red"};
`;
const FormButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;
const ResetButton = styled.button`
  flex: 0 1 0;
`;
const PaypalLink = styled.a`
  flex: 0 1 0;
`;
