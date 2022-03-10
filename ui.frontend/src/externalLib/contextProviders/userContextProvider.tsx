// import { createContext, useCallback, useContext, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { State, initAccountUser } from "../store";

// const UserContext = createContext<any | undefined>(undefined);
// const Provider = (props: any) => {
//   const { children } = props;
//   const userState = useSelector((state: State) => state.user);
//   const dispatch = useDispatch();

//   const initAccountUserUpdater = useCallback(
//     (payload: any) => dispatch(initAccountUser(payload)),
//     [dispatch]
//   );

//   const contextValue = useMemo(() => {
//     const user = userState;

//     return { user, initAccountUser: initAccountUserUpdater };
//   }, [userState, initAccountUserUpdater]);

//   return (
//     <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
//   );
// };

// const useUserContext = () => useContext(UserContext);

// export { Provider as UserContextProvider, useUserContext };

export {};
