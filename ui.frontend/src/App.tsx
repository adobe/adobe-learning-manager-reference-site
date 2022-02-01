import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config from "./config/config";
import { AppContextProvider } from "./contextProviders";
import {
  useAuthContext,
  Portal,
  useAccount,
  AEMLearnCatalogFilters,
  useCatalog,
} from "./externalLib";
import store from "./store/APIStore";

(window as any).baseUrl = "https://captivateprimestage1.adobe.com/primeapi/v2/";
(window as any).token = "oauth 712e0f1564c5d79a974a29414a8b162b";

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
  // console.log("Re-Rendering Test Component");
  //you can use the context directly like this
  const { accessToken, updateAccessToken } = useAuthContext();
  const { account } = useAccount();
  const { items } = useCatalog();
  const authenticateUser = () => {
    updateAccessToken(Math.random());
  };
  console.log("state : ", store.getState());
  return (
    <>
      <button onClick={authenticateUser}>Get Access Token </button>
      User details : {accessToken} {account.name}
      <AEMLearnCatalogFilters></AEMLearnCatalogFilters>
      {/* <button onClick={fetchTrainings}>Fetch Training</button> */}
      {items?.map((item) => (
        <div key={item.id}>{item.id}</div>
      ))}
    </>
  );
};

export default App;
