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
  ActionButton,
  DialogTrigger,
  Provider,
  lightTheme,
} from "@adobe/react-spectrum";
import { getUploadInfo } from "../../../utils/uploadUtils";
import { PrimeCommunityAddPostDialog } from "../PrimeCommunityAddPostDialog";
import styles from "./PrimeCommunityAddPostDialogTrigger.module.css";
import { useRef, useEffect } from "react";

const PrimeCommunityAddPostDialogTrigger = (props: any) => {
  const showDialog = useRef(false);
  useEffect(() => {
    if (props.openDialog && !showDialog.current) {
      const launchDialog = document.getElementById(
        "hiddenActionButton"
      ) as HTMLElement;
      launchDialog.click();
      showDialog.current = true;
    }
  });

  const closeDialogHandler = (close: any) => {
    if (typeof props.closeDialogHandler === "function") {
      props.closeDialogHandler();
    }
    close();
  };

  const savePostHandler = (
    event: any,
    input: any,
    postingType: any,
    resource: any,
    isResourceModified: any,
    pollOptions: any,
    close: any
  ) => {
    if (typeof props.savePostHandler === "function") {
      props.savePostHandler(
        input,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
    }
    close();
  };

  const onClickHandler = () => {
    getUploadInfo();
  };

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <DialogTrigger>
        {props.openDialog ? (
          <ActionButton
            id="hiddenActionButton"
            UNSAFE_className={styles.primeHiddenDialogLaunchButton}
            onPress={onClickHandler}
          ></ActionButton>
        ) : (
          <ActionButton
            id="showAddPostDialog"
            UNSAFE_className={`almButton primary ${styles.primeDialogLaunchButton}`}
            onPress={onClickHandler}
          >
            {props.buttonLabel}
          </ActionButton>
        )}
        {(close: any) => (
          <PrimeCommunityAddPostDialog
            post={props.post}
            description={props.description}
            mode={props.mode}
            saveHandler={(
              event: any,
              input: any,
              postingType: any,
              resource: any,
              isResourceModified: any,
              pollOptions: any
            ) => {
              savePostHandler(
                event,
                input,
                postingType,
                resource,
                isResourceModified,
                pollOptions,
                close
              );
            }}
            closeHandler={() => {
              closeDialogHandler(close);
            }}
          ></PrimeCommunityAddPostDialog>
        )}
      </DialogTrigger>
    </Provider>
  );
};

export default PrimeCommunityAddPostDialogTrigger;
