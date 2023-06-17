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
          all: initial;
        }
      `}
    />
    <Form />
  </>
);

document.body.appendChild(root);
