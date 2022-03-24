import { useCallback, useEffect, useState } from "react";
import { AccountActiveFields } from "../../models/custom";
import { PrimeUser } from "../../models/PrimeModels";
import {
  getAccountActiveFields,
  getALMConfig,
  getALMUser,
  updateALMUser,
} from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";
import { getUploadInfo, uploadFile } from "../../utils/uploadUtils";

interface ProfileAttributes {
  user: PrimeUser;
  accountActiveFields: AccountActiveFields;
}

export const useProfile = () => {
  const [profileAttributes, setProfileAttributes] = useState<ProfileAttributes>(
    { user: {}, accountActiveFields: {} } as ProfileAttributes
  );

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const setupProfile = async () => {
      try {
        const [userResponse, response] = await Promise.all([
          getALMUser(),
          getAccountActiveFields(),
        ]);
        setProfileAttributes({
          user: userResponse.user,
          accountActiveFields: response,
        });
      } catch (error) {
        setErrorMessage("Error fetching profile details");
        console.error("Error etching profile details : ", error);
      }
    };

    setupProfile();
  }, []);

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
      setProfileAttributes((prevState) => ({
        accountActiveFields: prevState.accountActiveFields,
        user: response.user,
      }));
    } catch (error: any) {
      setErrorMessage("Error while uploading the image");
      console.error("Error while uploading the image : ", error);
    }
  }, []);
  return { profileAttributes, updateProfileImage, errorMessage };
};
