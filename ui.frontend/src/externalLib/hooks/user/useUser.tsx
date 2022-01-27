import React, { useCallback } from "react";
import { useUserContext } from "../../contextProviders";

export const useUser = () => {
  const { user, loadUser } = useUserContext();

  const loadTheUsers = useCallback(async () => {
    const id = Math.floor(Math.random() * 10 + 1);
    const result = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    const data = await result.json();
    //before dispacthing convert it to required format
    loadUser(data);
  }, [loadUser]);

  return {
    user,
    loadTheUsers,
  };
};
