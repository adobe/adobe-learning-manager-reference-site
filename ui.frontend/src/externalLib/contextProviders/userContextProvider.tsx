import React, { createContext, useContext } from "react";
import { connect } from "react-redux";
import { State } from "../store";
import { initAccountUser } from "../store";

const UserContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { user, initAccountUser, children } = props;
  const contextValue = { user, initAccountUser };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

const user = (state: State) => ({ user: state.user });

const mapDispatchToProps = {
  initAccountUser,
};

const UserContextProvider = connect(
  user,
  mapDispatchToProps
)(Provider as any);

const useUserContext = () => useContext(UserContext);

export { UserContextProvider, useUserContext };
