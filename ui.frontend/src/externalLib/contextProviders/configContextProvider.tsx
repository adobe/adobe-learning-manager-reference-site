import { createContext, useContext, useState } from "react";

export interface AEMConfig {
  baseApiUrl: string;
  pagePaths: {
    baseUrl: string;
    instance: string;
    catalog: string;
    loOverview: string;
    community: string;
  };
}

const ConfigContext = createContext<any | undefined>(undefined);

const Provider = (props: any) => {
  const [config] = useState(props.config);

  return (
    <ConfigContext.Provider value={config}>
      {props.children}
    </ConfigContext.Provider>
  );
};

const useConfigContext = () => useContext(ConfigContext);

export { Provider as ConfigContextProvider, useConfigContext };
