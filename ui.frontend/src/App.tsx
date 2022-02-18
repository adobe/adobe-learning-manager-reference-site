import config, { primeConfig } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { IntlProvider } from "react-intl";
import {
  Portal,
  ConfigContextProvider,
  PrimeNotificationContainer,
  PrimeCatalogContainer,
  PrimeTrainingPage,
  useUserContext,
  useUser,
} from "./externalLib";
import store from "./store/APIStore";
import "./App.css";
import { PrimeInstancePage } from "./externalLib";

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
          {/* 
          <Portal selector={mountingPoints.trainingOverviewPage}>
            <PrimeTrainingPage />
          </Portal> */}
          {/* <Portal selector={mountingPoints.instanceContainer}>
            <PrimeInstancePage />
          </Portal> */}

          <Portal selector={mountingPoints.catalogContainer}>
            <PrimeCatalogContainer />
          </Portal>
          
        </AppContextProvider>
      </ConfigContextProvider>
    </IntlProvider>
  );
};

export default App;
