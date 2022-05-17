/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useCallback, useEffect, useState } from "react";
import { AccountActiveFields } from "../../models/custom";
import { PrimeUser } from "../../models/PrimeModels";
import {
  getAccountActiveFields,
  getALMConfig,
  getALMUser,
  updateAccountActiveFieldsDetails,
  updateALMUser,
  updateUserProfileImage
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

  const [userFieldData, setUserFieldData] = useState<any>({ fields: {} });
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
        const userFields : any = {};
        userFields.fields =  userResponse.user.fields;
        setUserFieldData(userFields);
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
      await updateUserProfileImage(response.user.avatarUrl);
      setErrorCode("");
    } catch (error: any) {
      setErrorCode(error.status);
    }
  }, []);

  const deleteProfileImage = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.delete({
        url: `${baseApiUrl}avatar`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/vnd.api+json;charset=UTF-8",
        },
      });
      const response = await updateALMUser();
      setProfileAttributes((prevState) => ({
        accountActiveFields: prevState.accountActiveFields,
        user: response.user,
      }));
      await updateUserProfileImage(response.user.avatarUrl);
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
    deleteProfileImage,
    errorCode,
    updateAccountActiveFields,
    userFieldData,
    setUserFieldData,
  };
};
