import React, { createContext, useContext } from "react";
import { connect } from "react-redux";
import { State } from "../store";
import { loadUser } from "../store";

const UserContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { user, loadUser, children } = props;
  const contextValue = { user, loadUser };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

const user = (state: State) => ({ user: state.user });

const mapDispatchToProps = {
  loadUser,
};

const UserContextProvider = connect(
  user,
  mapDispatchToProps
)(Provider as any);

const useUserContext = () => useContext(UserContext);

export { UserContextProvider, useUserContext };
