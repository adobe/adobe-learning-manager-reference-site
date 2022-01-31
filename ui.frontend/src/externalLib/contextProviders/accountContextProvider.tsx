import { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { initAccountUser } from "../store";

const AccountContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { children } = props;
  const account = useSelector((state: State) => state.account);
  const dispatch = useDispatch();

  const initAccountUserUpdater = (payload: any) =>
    dispatch(initAccountUser(payload));

  const contextValue = { account, initAccountUser: initAccountUserUpdater };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccountContext = () => useContext(AccountContext);

export { Provider as AccountContextProvider, useAccountContext };
