import React, { createContext, useContext } from "react";
import { connect } from "react-redux";
import { State } from "../store";
import { updateAccessToken } from "../store";

const AuthContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { accessToken, updateAccessToken, children } = props;
  const contextValue = { accessToken, updateAccessToken };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const accessToken = (state: State) => ({ accessToken: state.accessToken });

const mapDispatchToProps = {
  updateAccessToken,
};

const AuthContextProvider = connect(
  accessToken,
  mapDispatchToProps
)(Provider as any);

const useAuthContext = () => useContext(AuthContext);

export { AuthContextProvider, useAuthContext };
