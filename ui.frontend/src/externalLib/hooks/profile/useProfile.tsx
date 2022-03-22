import { useCallback, useEffect, useState } from "react";
import { PrimeUser } from "../../models/PrimeModels";
import { getALMConfig, getALMUser, updateALMUser } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";
import { getUploadInfo, uploadFile } from "../../utils/uploadUtils";

export const useProfile = () => {
  const [state, setState] = useState<{ user: PrimeUser; errorCode: string }>({
    user: {} as PrimeUser,
    errorCode: "",
  });
  const { user, errorCode } = state;

  const getUser = useCallback(async () => {
    try {
      const response = await getALMUser();
      setState({ user: response.user, errorCode: "" });
    } catch (error: any) {
      setState({ user: {} as PrimeUser, errorCode: error.status });
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
      setState({ user: response.user, errorCode: "123" });
    } catch (error: any) {
      setState({ user: {} as PrimeUser, errorCode: error.status });
    }
  }, []);
  return { user, updateProfileImage, errorCode };
};
