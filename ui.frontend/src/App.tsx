import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config, { primeConfig } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { IntlProvider } from "react-intl";
import {
  Portal,
  ConfigContextProvider,
  PrimeNotificationContainer,
  PrimeCatalogContainer,
} from "./externalLib";
import store from "./store/APIStore";

const App = (props: any) => {
  const { mountingPoints } = config;
  store.subscribe(() => console.log(store.getState()));
  return (
    <IntlProvider locale={props.locale} messages={props.messages}>
      <ConfigContextProvider config={primeConfig}>
        <AppContextProvider>
          <Test />

          <Navigation />
          <Portal selector={mountingPoints.navContainer}></Portal>

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
      </ConfigContextProvider>
    </IntlProvider>
  );
};

const Test = () => {
  return (
    <>
      <PrimeNotificationContainer />
      {/* <button onClick={loadMoreTraining}>LoadMore</button> */}
      {/* <PrimeCatalogFilters></PrimeCatalogFilters> */}
      {/* <button onClick={fetchTrainings}>Fetch Training</button> */}
      <PrimeCatalogContainer />
      {/* <PrimeTrainingOverview /> */}
    </>
  );
};

export default App;
