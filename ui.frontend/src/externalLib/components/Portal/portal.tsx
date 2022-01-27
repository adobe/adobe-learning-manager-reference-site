import ReactDOM from "react-dom";
import React, { Suspense } from "react";

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
