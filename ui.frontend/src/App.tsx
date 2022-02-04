import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config, { aemConfig } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import {
  useAuthContext,
  Portal,
  useAccount,
  AemLearnCatalog,
  ConfigContextProvider,
} from "./externalLib";

(window as any).baseUrl = "https://captivateprimestage1.adobe.com/primeapi/v2/";
(window as any).token = "oauth 887a15f30babe76cf8345e5f1d8b7874";

const App = () => {
  const { mountingPoints } = config;
  return (
    <ConfigContextProvider config={aemConfig}>
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
  );
};

const Test = () => {
  // console.log("Re-Rendering Test Component");
  //you can use the context directly like this
  const { accessToken, updateAccessToken } = useAuthContext();
  const { account } = useAccount();
  // const { items, loadMoreTraining } = useCatalog();
  const authenticateUser = () => {
    updateAccessToken(Math.random());
  };
  return (
    <>
      <button onClick={authenticateUser}>Get Access Token </button>
      User details : {accessToken} {account.name}
      {/* <button onClick={loadMoreTraining}>LoadMore</button> */}
      {/* <AEMLearnCatalogFilters></AEMLearnCatalogFilters> */}
      {/* <button onClick={fetchTrainings}>Fetch Training</button> */}
      <AemLearnCatalog />
    </>
  );
};

export default App;
