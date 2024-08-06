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

import ALMPrimeWidgets from "./ALMPrimeWidgets";
import { IntlProvider } from "react-intl";

window.onload = async () => {
  //   const { locale, messages } = await loadLocaleData();
  //   // if (getALMObject().isPrimeUserLoggedIn()) {
  //   //   await getALMUser();
  //   // }
  //   await init();
  // if (widgetConfig.querySelector) {
  //     const parentEl = document.querySelector(widgetConfig.querySelector);
  //     if (parentEl) {
  //     widgetParentEl = parentEl;
  //     }
  // }
  // if (widgetParentEl == undefined) {
  //     const containerEl = document.createElement('div');
  //     // containerEl.className = "prime-auto-container";
  //     document.body.appendChild(containerEl);
  //     widgetParentEl = containerEl;
  // }
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  ReactDOM.render(
    <>
      <IntlProvider locale="en">{/* <ALMPrimeWidgets /> */}</IntlProvider>
    </>,

    root
  );
};
