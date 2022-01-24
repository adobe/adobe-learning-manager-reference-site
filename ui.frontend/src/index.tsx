import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";


// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

window.onload = async () => {
  // const { locale, messages } = await loadLocaleData();
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  ReactDOM.render(<App />, root);
};
