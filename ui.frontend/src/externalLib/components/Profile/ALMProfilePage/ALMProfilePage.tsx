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
import { Button, lightTheme, Provider, ProgressBar } from "@adobe/react-spectrum";
import Edit from "@spectrum-icons/workflow/Edit";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useProfile } from "../../../hooks";
import {
  getALMConfig,
  getConfigurableAttributes,
  PrimeConfig,
} from "../../../utils/global";
import ALMBackButton from "../../Common/ALMBackButton/ALMBackButton";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import ALMActiveFields from "./ALMActiveFields";
import styles from "./ALMProfilePage.module.css";
import ALMSkillComponent from "./ALMSkillComponent";
import store from "../../../../store/APIStore";
import {
  SOCIAL_CANCEL_SVG,
} from "../../../utils/inline_svg";
import { cancelUploadFile } from "../../../utils/uploadUtils";

const getActiveFieldAttributes = (config: PrimeConfig) => {
  let cssSelector = config.mountingPoints.profilePageContainer;
  const activeFieldAttributes = getConfigurableAttributes(cssSelector) || {};
  return activeFieldAttributes;
};

const ALMProfilePage = () => {
  const { formatMessage } = useIntl();
  const config = getALMConfig();
  const {
    profileAttributes,
    updateProfileImage,
    updateAccountActiveFields,
    userFieldData,
    setUserFieldData,
  } = useProfile();
  const { user, accountActiveFields } = profileAttributes;
  const [predefinedMultiValues, setPredefinedMultiValues] = useState(new Map());
  const [ isUploading, setIsUploading] = useState(false);
  const state = store.getState();
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );
  console.log("Active fields :: " + accountActiveFields);
  const activeFieldAttributes = getActiveFieldAttributes(config);
  const {
    section1ActiveFields,
    section1Description,
    section1Title,
    section2ActiveFields,
    section2Description,
    section2Title,
  } = activeFieldAttributes;

  useEffect(() => {
    let multiValues: any;
    let selectedMultiValues = new Map();
    const userFields: any = user.fields;
    if (userFields == undefined) {
      accountActiveFields?.fields?.map((filteredArrayTemp1: any) => {
        selectedMultiValues.set(filteredArrayTemp1, false);
      });
      setPredefinedMultiValues(selectedMultiValues);
    } else {
      accountActiveFields?.fields?.map((activeField) => {
        if (activeField.allowedValues.length > 0 && activeField.isMultiValue) {
          if (userFields[activeField.name] != undefined) {
            multiValues = userFields[activeField.name].filter((value: string) =>
              activeField.allowedValues.includes(value)
            );
          }
          multiValues?.map((filteredArrayTemp1: any) => {
            selectedMultiValues.set(filteredArrayTemp1, true);
          });
        }
      });
      setPredefinedMultiValues(selectedMultiValues);
    }
  }, [user]);

  const updateSelectedMultiValues = (allowedValue: any, value: boolean) => {
    let selectedMultiValues = new Map(predefinedMultiValues);
    selectedMultiValues.set(allowedValue, value);
    setPredefinedMultiValues(selectedMultiValues);
  };

  const inputRef = useRef<null | HTMLInputElement>(null);

  const updateFileUpdateProgress = () => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  const imageUploaded = async (event: any) => {
    let file: any;
    const fileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < fileList!.length; i++) {
      if (fileList![i].type.match(/^image\//)) {
        file = fileList![i];
        break;
      }
    }
    setFileUploadProgress(0);
    setIsUploading(true);
    const progressCheck = setInterval(() => {
      updateFileUpdateProgress();
    }, 500);
    await updateProfileImage(file.name, file);
    clearInterval(progressCheck);
    setIsUploading(false);
  };

  const onActiveFieldUpdate = (value: any, name: any) => {
    let fields: any = userFieldData.fields;
    if (fields == undefined || fields == null) {
      userFieldData.fields = {};
      fields = userFieldData.fields;
    }
    fields[name] = value;
    let userField: any = {};
    userField.fields = userFieldData.fields;
    setUserFieldData(userField);
  };

  const onSwitchValueUpdate = (
    attrName: any,
    attrValue: any,
    fieldName: any
  ) => {
    let fields: any = userFieldData.fields;
    if (fields == undefined || fields == null) {
      userFieldData.fields = {};
      fields = userFieldData.fields;
    }
    if (attrValue) {
      if (fields[fieldName] == undefined) {
        fields[fieldName] = [];
      }
      fields[fieldName].push(attrName);
    }
    // Remove the value from data if user switch off.
    else {
      fields[fieldName] = fields[fieldName].filter((x: any) => x !== attrName);
      let data: any = {};
      data.fields = userFieldData.fields;
      setUserFieldData(data);
    }
  };

  const UpdateAccountActiveFields = async () => {
    let data: any = userFieldData.fields;
    await updateAccountActiveFields(data, user?.id);
  };

  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  const cancelClickHandler = () => {
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsUploading(false);
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <div className={styles.userProfileContainer}>
            <section className={styles.userProfile}>
              <input
                type="file"
                id="uploadAvatar"
                accept="image/*"
                onChange={(event: any) => imageUploaded(event)}
                ref={inputRef}
              />
              <h1 className={styles.profileHeader}>Your Profile</h1>
              <ALMBackButton />
              <div className={styles.detailsContainer}>
                <div className={styles.image}>
                  <img
                    className={styles.profileImage}
                    src={user.avatarUrl}
                    alt="profile"
                  />
                  {!isUploading &&
                    <Button
                      variant="primary"
                      isQuiet
                      UNSAFE_className={styles.button}
                      onPress={startFileUpload}
                    >
                      {formatMessage({
                        id: "alm.profile.change.image",
                        defaultMessage: "Change image",
                      })}
                    </Button>
                  }
                    <Button
                      variant="cta"
                      isQuiet
                      UNSAFE_className={styles.editIcon}
                      onPress={startFileUpload}
                    >
                      <Edit />
                    </Button>
                  {isUploading && (
                    <div className={styles.progressArea}>
                      <ProgressBar
                        label={formatMessage({
                          id: "alm.uploading.label",
                          defaultMessage: "Uploading...",
                        })}
                        value={fileUploadProgress}
                      />
                      <button
                        className={styles.primeStatusSvg}
                        title={formatMessage({
                          id: "alm.removeUpload.label",
                          defaultMessage: "Remove upload",
                        })}
                      onClick={cancelClickHandler}
                      >
                        {SOCIAL_CANCEL_SVG()}
                      </button>
                    </div>
                  )}
                  {isUploading && (
                    <div className={styles.progressAreaMobile}>
                      <ProgressBar
                        value={fileUploadProgress}
                      />
                      <button
                        className={styles.primeStatusSvg}
                        title={formatMessage({
                          id: "alm.removeUpload.label",
                          defaultMessage: "Remove upload",
                        })}
                      onClick={cancelClickHandler}
                      >
                        {SOCIAL_CANCEL_SVG()}
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.details}>
                  <h2 className={styles.name}>{user.name}</h2>
                  <h3 className={styles.email}>{user.email}</h3>
                </div>
              </div>
            </section>
          </div>

          <ALMSkillComponent></ALMSkillComponent>
          <ALMActiveFields
            title={section1Title}
            description={section1Description}
            activeFields={section1ActiveFields}
            user={user}
            accountActiveFields={accountActiveFields}
            onActiveFieldUpdate={onActiveFieldUpdate}
            onSwitchValueUpdate={onSwitchValueUpdate}
            userFieldData={userFieldData}
            updateSelectedMultiValues={updateSelectedMultiValues}
            predefinedMultiValues={predefinedMultiValues}
          />
          <ALMActiveFields
            title={section2Title}
            description={section2Description}
            activeFields={section2ActiveFields}
            user={user}
            accountActiveFields={accountActiveFields}
            onActiveFieldUpdate={onActiveFieldUpdate}
            onSwitchValueUpdate={onSwitchValueUpdate}
            userFieldData={userFieldData}
            updateSelectedMultiValues={updateSelectedMultiValues}
            predefinedMultiValues={predefinedMultiValues}
          />
          <section>
            <></>
            <hr style={{ width: "1100px" }} />
            <div className={styles.activeFieldButtonContainer}>
              <Button
                UNSAFE_className={styles.activeFieldsSaveOption}
                variant="cta"
                onPress={UpdateAccountActiveFields}
              >
                {formatMessage({
                  id: "alm.profile.fields.saveProfileChanges",
                  defaultMessage: "Save Changes",
                })}
              </Button>
            </div>
          </section>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ALMProfilePage;
