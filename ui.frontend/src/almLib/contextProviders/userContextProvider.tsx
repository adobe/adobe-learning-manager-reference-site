/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { PrimeUser } from '../models';
import { getALMAccount, getALMUser, updateALMUser } from '../utils/global';
import { PrimeEvent } from '../utils/widgets/common';

interface UserContextValue {
  user: PrimeUser;
  setUser: (user: PrimeUser) => void;
}

interface UserContextProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const Provider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<PrimeUser>({} as PrimeUser);

  const updateUser = useCallback(async () => {
    const response = await updateALMUser();
    const updatedUser = response?.user;
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      const fetchedUser = response?.user;
      if (fetchedUser) {
        setUser(fetchedUser);
      } else {
        const account = await getALMAccount();
        setUser({ account } as PrimeUser);
      }
    })();
  }, []);

  useEffect(() => {
    document.addEventListener(PrimeEvent.ALM_USER_PROFILE_UPDATED, updateUser);
    return () => {
      document.removeEventListener(PrimeEvent.ALM_USER_PROFILE_UPDATED, updateUser);
    };
  }, [updateUser]);

  const nlAccountLoaded = user?.account?.id;
  const shouldRenderChildren = nlAccountLoaded || user?.id;

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <UserContext.Provider value={contextValue}>
      {shouldRenderChildren ? children : null}
    </UserContext.Provider>
  );
};

const useUserContext = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

export { Provider as UserContextProvider, useUserContext };
