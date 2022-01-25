import ReactDOM from "react-dom";
import React, { Suspense } from "react";

import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { useAuthContext } from "./externalLib";
import store from "./store/APIStore";

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

const TestPortal = withSuspense(Portal);

const App = () => {
  const { mountingPoints } = config;
  console.log(store.getState());
  return (
    <AppContextProvider>
      <Test />
      <TestPortal selector={mountingPoints.navContainer}>
        <Navigation />
      </TestPortal>

      <TestPortal selector={mountingPoints.loOverviewContainer}>
        <LoOverview />
      </TestPortal>

      <TestPortal selector={mountingPoints.catalogContainer}>
        <Catalog />
      </TestPortal>

      <TestPortal selector={mountingPoints.boardsContainer}>
        <Boards />
      </TestPortal>

      <TestPortal selector={mountingPoints.boardContainer}>
        <Board />
      </TestPortal>
    </AppContextProvider>
  );
};

const Test = () => {
  //you can use the context directly like this
  const { accessToken, updateAccessToken } = useAuthContext();
  const authenticateUser = () => {
    updateAccessToken("abcd");
  };
  return (
    <button onClick={authenticateUser}>Hi From Test, {accessToken}</button>
  );
};

export default App;
