import { createContext, useContext, useState } from "react";
import { setALMKeyValue } from "../utils/global";

export interface PrimeConfig {
  ALMbaseUrl: string;
  baseApiUrl: string;
  hostUrl: string;
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
  mountingPoints: {
    [key: string]: string;
  };
}

const ConfigContext = createContext<any | undefined>(undefined);

const Provider: React.FC<{ config: PrimeConfig }> = (props) => {
  const [config] = useState(props.config);

  setALMKeyValue("config", config);
  return (
    <ConfigContext.Provider value={config}>
      {props.children}
    </ConfigContext.Provider>
  );
};

const useConfigContext = () => useContext(ConfigContext);

export { Provider as ConfigContextProvider, useConfigContext };
