import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { useAuthContext, Portal, useAccount, AEMLearnCatalogFilters } from "./externalLib";

const App = () => {
  const { mountingPoints } = config;
  return (
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
  );
};

const Test = () => {
  console.log("Re-Rendering Test Component");
  //you can use the context directly like this
  const { accessToken, updateAccessToken } = useAuthContext();
  const { account } = useAccount();
  const authenticateUser = () => {
    updateAccessToken(Math.random());
  };
  const filters = ["1", "2", "3"];
  return (
    <>
      <button onClick={authenticateUser}>Get Access Token </button>
      User details : {accessToken} {account.name}
      <AEMLearnCatalogFilters filters={filters}></AEMLearnCatalogFilters>
    </>
  );
};

export default App;
