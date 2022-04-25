import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

// const root = ReactDOM.render(<React.StrictMode>
//   <App />
// </React.StrictMode>, document.getElementById("alm-commerce"));

window.onload = async () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  ReactDOM.render(<App />, root);
};

