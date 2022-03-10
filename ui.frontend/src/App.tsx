import { IntlProvider } from "react-intl";
import "./App.css";
import { mountingPoints } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import {
  Portal,
  PrimeCatalogContainer,
  PrimeCommunityBoardPage,
  PrimeNotificationContainer,
  PrimeTrainingPage,
} from "./externalLib";

const App = (props: any) => {
  // const { mountingPoints } = config;
  //store.subscribe(() => console.log(store.getState()));
  return (
    <IntlProvider locale={props.locale} messages={props.messages}>
      {/* <ConfigContextProvider config={primeConfig}> */}
      <AppContextProvider>
        <Portal selector={mountingPoints.notificationContainer}>
          <PrimeNotificationContainer />
        </Portal>
        <Portal selector={mountingPoints.catalogContainer}>
          <PrimeCatalogContainer />
        </Portal>
        <Portal selector={mountingPoints.trainingOverviewPage}>
          <PrimeTrainingPage />
        </Portal>
        <Portal selector={mountingPoints.boardsContainer}>
          <PrimeCommunityBoardPage />
        </Portal>
      </AppContextProvider>
      {/* </ConfigContextProvider> */}
    </IntlProvider>
  );
};

export default App;
