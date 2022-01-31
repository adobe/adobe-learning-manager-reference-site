import { createContext, useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { updateAccessToken } from "../store";

const AuthContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { children } = props;
  const authState = useSelector((state: State) => state.accessToken);
  const dispatch = useDispatch();

  const updateAccessTokenUpdater = useCallback(
    (payload: any) => dispatch(updateAccessToken(payload)),
    [dispatch]
  );

  const contextValue = useMemo(() => {
    const accessToken = authState;

    return { accessToken, updateAccessToken: updateAccessTokenUpdater };
  }, [authState, updateAccessTokenUpdater]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const useAuthContext = () => useContext(AuthContext);

export { Provider as AuthContextProvider, useAuthContext };
