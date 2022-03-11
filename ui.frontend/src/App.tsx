import { IntlProvider } from "react-intl";
import "./App.css";
import { mountingPoints } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import {
  Portal,
  PrimeCatalogContainer,
  PrimeCommunityBoardList,
  PrimeCommunityBoardPage,
  PrimeInstancePage,
  PrimeNotificationContainer,
  PrimeTrainingPage,
} from "./externalLib";
import { ALMProfilePage } from "./externalLib/components/Profile/ALMProfilePage";

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
        <Portal selector={mountingPoints.instanceContainer}>
          <PrimeInstancePage />
        </Portal>

        <Portal selector={mountingPoints.profilePageContainer}>
          <ALMProfilePage />
        </Portal>

        <Portal selector={mountingPoints.boardContainer}>
          <PrimeCommunityBoardPage />
        </Portal>
        <Portal selector={mountingPoints.boardsContainer}>
          <PrimeCommunityBoardList />
        </Portal>
      </AppContextProvider>
      {/* </ConfigContextProvider> */}
    </IntlProvider>
  );
};

export default App;
