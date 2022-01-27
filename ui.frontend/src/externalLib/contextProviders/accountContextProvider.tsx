import React, { createContext, useContext } from "react";
import { connect } from "react-redux";
import { State } from "../store";
import { initAccountUser } from "../store";

const AccountContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { account, initAccountUser, children } = props;
  const contextValue = { account, initAccountUser };

  return (
    <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>
  );
};

const account = (state: State) => ({ account: state.account });

const mapDispatchToProps = {
  initAccountUser,
};

const AccountContextProvider = connect(
  account,
  mapDispatchToProps
)(Provider as any);

const useAccountContext = () => useContext(AccountContext);

export { AccountContextProvider, useAccountContext };
