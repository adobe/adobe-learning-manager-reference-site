import { useEffect, useState } from "react";
import { PrimeUser } from "../../models/PrimeModels";
import { getALMUser } from "../../utils/global";

export const useProfile = () => {
  const [user, setUser] = useState<PrimeUser>({} as PrimeUser);
  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      setUser(response.user);
    })();
  }, []);
  return { user };
};
