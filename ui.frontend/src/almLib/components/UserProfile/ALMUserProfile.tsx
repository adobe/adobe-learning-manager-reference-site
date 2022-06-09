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
import {
  Button,
  lightTheme,
  ProgressBar,
  Provider,
} from "@adobe/react-spectrum";
import Edit from "@spectrum-icons/workflow/Edit";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../store/APIStore";
import { useProfile } from "../../hooks";
import { SOCIAL_CANCEL_SVG } from "../../utils/inline_svg";
import { cancelUploadFile } from "../../utils/uploadUtils";
import ALMBackButton from "../Common/ALMBackButton/ALMBackButton";
import { ALMErrorBoundary } from "../Common/ALMErrorBoundary";
import styles from "./ALMUserProfile.module.css";

const ALMUserProfile = () => {
  const { formatMessage } = useIntl();
  const { profileAttributes, updateProfileImage, deleteProfileImage } =
    useProfile();
  const { user } = profileAttributes;
  const [isUploading, setIsUploading] = useState(false);
  const [changeImage, setChangeImage] = useState(false);
  const state = store.getState();
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );

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
    setChangeImage(false);
  };

  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  const deleteImage = async () => {
    await deleteProfileImage();
    setChangeImage(false);
  };

  const cancelClickHandler = () => {
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsUploading(false);
    setChangeImage(false);
  };

  const changeImageClickHandler = () => {
    setChangeImage(true);
  };

  const isEditImageState = () => {
    return !isUploading && changeImage;
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
              <h1 className={styles.profileHeader}>
                {formatMessage({
                  id: "alm.profile.name",
                  defaultMessage: "Your Profile",
                })}
              </h1>
              <ALMBackButton />
              <div
                className={
                  isEditImageState()
                    ? styles.detailsContainerWithBottomPadding
                    : styles.detailsContainer
                }
              >
                <div className={styles.image}>
                  <div className={styles.imageWrapper}>
                    <img
                      className={styles.profileImage}
                      src={user.avatarUrl}
                      alt="profile"
                    />
                  </div>
                  {!isUploading && !changeImage && (
                    <Button
                      variant="primary"
                      isQuiet
                      UNSAFE_className={styles.button}
                      onPress={changeImageClickHandler}
                    >
                      {formatMessage({
                        id: "alm.profile.change.image",
                        defaultMessage: "Change image",
                      })}
                    </Button>
                  )}
                  {isEditImageState() && (
                    <>
                      <Button
                        variant="primary"
                        isQuiet
                        UNSAFE_className={styles.button}
                        onPress={startFileUpload}
                      >
                        {formatMessage({
                          id: "alm.profile.edit.image",
                          defaultMessage: "Edit image",
                        })}
                      </Button>
                      <div className={styles.deleteImage}>
                        <Button
                          variant="primary"
                          isQuiet
                          UNSAFE_className={styles.button}
                          onPress={deleteImage}
                        >
                          {formatMessage({
                            id: "alm.profile.delete.image",
                            defaultMessage: "Delete image",
                          })}
                        </Button>
                      </div>
                    </>
                  )}
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
                      <ProgressBar value={fileUploadProgress} />
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
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ALMUserProfile;
