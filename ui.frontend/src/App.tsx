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
          <Portal selector={mountingPoints.notificationContainer}>
            <PrimeNotificationContainer />
          </Portal>
          <Portal selector={mountingPoints.catalogContainer}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <PrimeCatalogContainer />
            </div>
          </Portal>
        </AppContextProvider>
      </ConfigContextProvider>
    </IntlProvider>
  );
};

export default App;
