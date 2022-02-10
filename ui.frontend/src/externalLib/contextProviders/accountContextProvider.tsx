import { createContext, useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { initAccountUser } from "../store";

const AccountContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { children } = props;
  const accountState = useSelector((state: State) => state.account);
  const dispatch = useDispatch();

  const initAccountUserUpdater = useCallback(
    (payload: any) => dispatch(initAccountUser(payload)),
    [dispatch]
  );

  const contextValue = useMemo(() => {
    const account = accountState;

    return { account, updateAccessToken: initAccountUserUpdater };
  }, [accountState, initAccountUserUpdater]);

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccountContext = () => useContext(AccountContext);

export { Provider as AccountContextProvider, useAccountContext };
