import React from "react";
import { Provider as ReduxProvider } from "react-redux"; //
import { AuthContextProvider } from "./authContextProvider";

/**
 * List of context providers that are required to run Venia
 *
 * @property {React.Component[]} contextProviders
 */
const contextProviders = [AuthContextProvider];

export const AEMLearnContextProviders = (props: React.PropsWithChildren<{}>) => {
  // console.log("Inside context provider", store.getState());
  return (
    <React.Fragment>
      {contextProviders.reduceRight((child, Provider) => {
        return <Provider>{child}</Provider>;
      }, props.children)}
    </React.Fragment>
  );
};
