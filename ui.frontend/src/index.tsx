/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import loadLocaleData from "./i18n/i18n";
import { getALMObject, getALMUser, init } from "./almLib/utils/global";

window.onload = async () => {
  const { locale, messages } = await loadLocaleData();
  // if (getALMObject().isPrimeUserLoggedIn()) {
  //   await getALMUser();
  // }
  await init();
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  ReactDOM.render(<App locale={locale} messages={messages} />, root);
};
