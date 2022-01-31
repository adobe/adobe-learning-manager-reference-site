import React from "react";
import { Provider as ReduxProvider } from "react-redux"; //
//import { LibContextProvider } from "adb-react-lib";
import { AEMLearnContextProviders } from "../externalLib";

import store from "../store/APIStore";

/**
 * List of context providers that are required to run Venia
 *
 * @property {React.Component[]} contextProviders
 */
const contextProviders = [AEMLearnContextProviders];

export const AppContextProvider = (props: React.PropsWithChildren<{}>) => {
  return (
    <ReduxProvider store={store}>
      {contextProviders.reduceRight((child, Provider) => {
        return <Provider>{child}</Provider>;
      }, props.children)}
    </ReduxProvider>
  );
};
