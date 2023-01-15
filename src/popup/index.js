import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = document.createElement("div");
createRoot(root).render(<App />);
document.body.appendChild(root);
