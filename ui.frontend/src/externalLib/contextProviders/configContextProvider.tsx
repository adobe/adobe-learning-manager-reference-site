import { createContext, useContext, useState } from "react";
import { ReactReduxContextValue } from "react-redux";

export interface PrimeConfig {
  baseApiUrl: string;
  accessToken: string;
  pagePaths: {
    baseUrl: string;
    instance: string;
    catalog: string;
    trainingOverview: string;
    community: string;
  };
  locale: string;
  cdnBaseUrl: string;
}

const ConfigContext = createContext<any | undefined>(undefined);

const Provider: React.FC<{ config: PrimeConfig }> = (props) => {
  const [config] = useState(props.config);

  (window as any).primeConfig = config;
  return (
    <ConfigContext.Provider value={config}>
      {props.children}
    </ConfigContext.Provider>
  );
};

const useConfigContext = () => useContext(ConfigContext);

export { Provider as ConfigContextProvider, useConfigContext };
