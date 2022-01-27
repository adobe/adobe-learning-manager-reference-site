import ReactDOM from "react-dom";
import React, { Suspense } from "react";

import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { useAuthContext, useUser, Portal, useAccount } from "./externalLib";
import store from "./store/APIStore";

const App = () => {
  const { mountingPoints } = config;
  console.log(store.getState());
  return (
    <AppContextProvider>
      <Test />

      <Portal selector={mountingPoints.navContainer}>
        <Navigation />
      </Portal>

      <Portal selector={mountingPoints.loOverviewContainer}>
        <LoOverview />
      </Portal>

      <Portal selector={mountingPoints.catalogContainer}>
        <Catalog />
      </Portal>

      <Portal selector={mountingPoints.boardsContainer}>
        <Boards />
      </Portal>

      <Portal selector={mountingPoints.boardContainer}>
        <Board />
      </Portal>
    </AppContextProvider>
  );
};

const Test = () => {
  //you can use the context directly like this
 // const { accessToken, updateAccessToken } = useAuthContext();
  const { user, initUser } = useUser();
  const { account } = useAccount();
  const authenticateUser = () => {
   // updateAccessToken("977987875cfb84db2470bb52a81ecbcd");
   initUser();
  };
  //console.log("user details : ", user);
  return (
    <>
      <button onClick={authenticateUser}>Hi From Test, </button>
      User details : {user.name} {account.name}
    </>
  );
};

export default App;
