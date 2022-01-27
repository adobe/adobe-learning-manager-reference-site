import React from "react";
import { AuthContextProvider } from "./authContextProvider";
import { UserContextProvider } from "./userContextProvider";

/**
 * List of context providers that are required to run Venia
 *
 * @property {React.Component[]} contextProviders
 */
const contextProviders = [AuthContextProvider, UserContextProvider];

export const AEMLearnContextProviders = (
  props: React.PropsWithChildren<{}>
) => {
  return (
    <React.Fragment>
      {contextProviders.reduceRight((child, Provider) => {
        return <Provider>{child}</Provider>;
      }, props.children)}
    </React.Fragment>
  );
};
