import Navigation from "./components/navigation";
import LoOverview from "./components/loOverview";
import Boards from "./components/boards";
import Board from "./components/board";
import Catalog from "./components/catalog";
import config, { primeConfig } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import { IntlProvider } from "react-intl";
import {
  useAuthContext,
  Portal,
  useAccount,
  ConfigContextProvider,
  PrimeCatalogContainer,
} from "./externalLib";

const App = (props: any) => {
  const { mountingPoints } = config;
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
  // console.log("Re-Rendering Test Component");
  //you can use the context directly like this
  const { accessToken, updateAccessToken } = useAuthContext();
  const { account } = useAccount();
  // const { user } = useUserContext();
  // const { items, loadMoreTraining } = useCatalog();
  const authenticateUser = () => {
    updateAccessToken(Math.random());
  };
  return (
    <>
      <button onClick={authenticateUser}>Get Access Token </button>
      User details : {accessToken} {account.name}
      {/* <button onClick={loadMoreTraining}>LoadMore</button> */}
      {/* <PrimeCatalogFilters></PrimeCatalogFilters> */}
      {/* <button onClick={fetchTrainings}>Fetch Training</button> */}
      <PrimeCatalogContainer />
      {/* <PrimeTrainingOverview /> */}
    </>
  );
};

export default App;
