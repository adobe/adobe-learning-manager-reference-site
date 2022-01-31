import { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State, updateAccessToken } from "../store";

const AuthContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const accessToken = useSelector((state: State) => state.accessToken);
  const dispatch = useDispatch();
  const { children } = props;
  
  const accessTokenUpdater = (payload: any) =>
    dispatch(updateAccessToken(payload));

  const contextValue = { accessToken, updateAccessToken: accessTokenUpdater };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const useAuthContext = () => useContext(AuthContext);

export { Provider as AuthContextProvider, useAuthContext };

// const accessToken = (state: State) => ({ accessToken: state.accessToken });

// const mapDispatchToProps = {
//   updateAccessToken,
// };

// const AuthContextProvider = connect(
//   accessToken,
//   mapDispatchToProps
// )(Provider as any);
