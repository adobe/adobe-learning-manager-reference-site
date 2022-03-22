import { useCallback, useEffect, useState } from "react";
import { PrimeUser } from "../../models/PrimeModels";
import { getALMConfig, getALMUser, updateALMUser } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";
import { getUploadInfo, uploadFile } from "../../utils/uploadUtils";

export const useProfile = () => {
  const [user, setUser] = useState<PrimeUser>({} as PrimeUser);
  const [errorMessage, setErrorMessage] = useState("");

  const getUser = useCallback(async () => {
    try {
      const response = await getALMUser();
      setUser(response.user);
    } catch (error) {
      setErrorMessage("Error getting the user details");
      console.error("Error getting the user details : ", error);
    }
  }, []);
  useEffect(() => {
    getUser();
  }, [getUser]);

  const updateProfileImage = useCallback(async (name: string, file: File) => {
    try {
      await getUploadInfo();
      const imageUrl = await uploadFile(name, file);
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.post({
        url: `${baseApiUrl}avatar`,
        method: "POST",
        body: JSON.stringify({
          imageUrl,
        }),
        headers: {
          "Content-Type": "application/vnd.api+json;charset=UTF-8",
        },
      });
      const response = await updateALMUser();
      setUser(response.user);
    } catch (error: any) {
      setErrorMessage("Error while uploading the image");
      console.error("Error while uploading the image : ", error.status);
    }
  }, []);
  return { user, updateProfileImage, errorMessage };
};
