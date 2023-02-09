import { createRoot } from "react-dom/client";
import { Global, css } from "@emotion/react";
import { Popup } from "./Popup";

const root = document.createElement("div");
root.id = "root";

createRoot(root).render(
  <>
    <Global
      styles={css`
        html, body {
          all: initial;
        }
      `}
    />
    <Popup />
  </>
);

document.body.appendChild(root);
