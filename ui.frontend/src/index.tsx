import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import loadLocaleData from "./i18n/i18n";

window.onload = async () => {
  const { locale, messages } = await loadLocaleData();
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  ReactDOM.render(<App locale={locale} messages={messages} />, root);
};
