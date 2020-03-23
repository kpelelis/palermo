import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { StateProvider } from "./state";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StateProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </StateProvider>,
  rootElement
);
