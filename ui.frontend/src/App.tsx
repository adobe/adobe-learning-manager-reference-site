import { lazy, Suspense } from "react";
import config, { primeConfig } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { IntlProvider } from "react-intl";

import {
  Portal,
  ConfigContextProvider,
  PrimeNotificationContainer,
  //PrimeCatalogContainer,
  PrimeTrainingPage,
  useUserContext,
  useUser,
} from "./externalLib";
import store from "./store/APIStore";
import "./App.css";


const  PrimeCatalogContainer = lazy(() => import("./externalLib/components/PrimeCatalogContainer/PrimeCatalogContainer"));

const App = (props: any) => {
  const { mountingPoints } = config;
  store.subscribe(() => console.log(store.getState()));
  return (
    <IntlProvider locale={props.locale} messages={props.messages}>
      <ConfigContextProvider config={primeConfig}>
        <AppContextProvider>
          {/* <Portal selector={mountingPoints.notificationContainer}>
            <PrimeNotificationContainer />
          </Portal> */}
         
          <Portal selector={mountingPoints.catalogContainer}>
            <Suspense fallback={<div>Loading...</div>}>
              <PrimeCatalogContainer />
            </Suspense>
          </Portal>
          <Portal selector={mountingPoints.trainingOverviewPage}>
              <PrimeTrainingPage />
          </Portal>
        </AppContextProvider>
      </ConfigContextProvider>
    </IntlProvider>
  );
};

export default App;
