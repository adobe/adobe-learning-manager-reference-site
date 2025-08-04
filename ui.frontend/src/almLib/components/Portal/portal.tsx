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
import ReactDOM from "react-dom";
import { Suspense } from "react";
import 'quill/dist/quill.snow.css';


const withSuspense = (Component: any) => {
  let WithSuspense: any = (props: any) => {
    return (
      <Suspense fallback={null}>
        <Component {...props} />
      </Suspense>
    );
  };
  WithSuspense.displayName = `withSuspense(${
    Component.displayName || Component.name
  })`;
  return WithSuspense;
};

const Portal = (props: any) => {
  let { selector, children } = props;

  let elem;
  if (selector instanceof HTMLElement) {
    elem = selector;
  } else if (typeof selector === "string") {
    elem = document.querySelector(selector);
  }

  if (elem) {
    // Only render children if mounting point is available
    return ReactDOM.createPortal(children, elem);
  }

  return null;
};

export default withSuspense(Portal);
