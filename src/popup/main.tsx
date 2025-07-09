import { createRoot } from "react-dom/client";
import { Global, css } from "@emotion/react";
import { Form } from "./Form";

const root = document.createElement("div");
root.id = "root";

createRoot(root).render(
  <>
    <Global
      styles={css`
        html,
        body {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          background: lightgrey;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          html,
          body {
            background-color: rgb(41, 42, 45) !important;
            color: #c8c8c8 !important;
          }
          background-color: rgb(41, 42, 45) !important;
          color: #c8c8c8 !important;
          * {
            background-color: rgb(41, 42, 45) !important;
            color: #c8c8c8 !important;
          }
        }
      `}
    />
    <Form />
  </>
);

document.body.appendChild(root);
