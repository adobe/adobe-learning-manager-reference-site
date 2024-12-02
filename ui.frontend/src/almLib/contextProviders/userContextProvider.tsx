import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State, initAccountUser } from "../store";
import { PrimeUser } from "../models";
import { getALMUser, updateALMUser } from "../utils/global";
import { PrimeEvent } from "../utils/widgets/common";

const UserContext = createContext<any | undefined>(undefined);
const Provider = (props: any) => {
  const { children } = props;
  //   const user = useSelector((state: State) => state.user);
  const [user, setUser] = useState({} as PrimeUser); // [1
  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      const user = response?.user;
      setUser(user || ({} as PrimeUser));
    })();
  }, []);
  useEffect(() => {
    document.addEventListener(PrimeEvent.ALM_USER_PROFILE_UPDATED, updateUser);
    return () => {
      document.removeEventListener(PrimeEvent.ALM_USER_PROFILE_UPDATED, updateUser);
    };
  }, []);

  const updateUser = async () => {
    const response = await updateALMUser();
    const user = response?.user;
    user && setUser(user);
  };

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

const useUserContext = () => useContext(UserContext);

export { Provider as UserContextProvider, useUserContext };
