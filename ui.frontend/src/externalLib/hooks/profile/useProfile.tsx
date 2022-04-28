import { useCallback, useEffect, useState } from "react";
import { AccountActiveFields } from "../../models/custom";
import { PrimeUser } from "../../models/PrimeModels";
import {
  getAccountActiveFields,
  getALMConfig,
  getALMUser,
  updateAccountActiveFieldsDetails,
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

  const [userFieldData, setUserFieldData] = useState<PrimeUser>(
    {fields: {} } as PrimeUser
  );
  // const [errorMessage, setErrorMessage] = useState("");

  const [errorCode, setErrorCode] = useState("");

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
        setUserFieldData(userResponse.user);
        setErrorCode("");
      } catch (error: any) {
        // setErrorMessage("Error fetching profile details");
        setErrorCode(error.status);
        console.error("Error fetching profile details : ", error);
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
      setErrorCode("");
    } catch (error: any) {
      setErrorCode(error.status);
    }
  }, []);

  const updateAccountActiveFields = useCallback(
    async (accountActiveFields: any, userId: any) => {
      try {
        await updateAccountActiveFieldsDetails(accountActiveFields, userId);
      } catch (error: any) {}
    },
    []
  );

  return {
    profileAttributes,
    updateProfileImage,
    errorCode,
    updateAccountActiveFields,
    userFieldData,
    setUserFieldData,
  };
};
