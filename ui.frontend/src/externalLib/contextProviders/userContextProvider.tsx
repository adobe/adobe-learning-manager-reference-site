import { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State, initAccountUser } from "../store";

const UserContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { children } = props;
  const user = useSelector((state: State) => state.user);
  const dispatch = useDispatch();

  const initAccountUserUpdater = (payload: any) =>
    dispatch(initAccountUser(payload));

  const contextValue = { user, initAccountUser: initAccountUserUpdater };
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

const useUserContext = () => useContext(UserContext);

export { Provider as UserContextProvider, useUserContext };
