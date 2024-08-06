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
import React, { useEffect, useMemo, useRef } from "react";
import { GetTranslation, getPreferredLocalizedMetadata } from "../../../utils/translationService";
import styles from "./ALMExtensionIframeDialog.module.css";
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
  Provider,
  Dialog,
  Heading,
  Divider,
  Content,
  DialogContainer,
} from "@adobe/react-spectrum";
import { InvocationType, getParsedJwt } from "../../../utils/native-extensibility";
import { PrimeExtension } from "../../../models";
import { useIntl } from "react-intl";
import {
  getALMConfig,
  getModalBackgroundColor,
  getModalTheme,
  isScreenBelowDesktop,
  sendEvent,
} from "../../../utils/global";
import { PrimeEvent } from "../../../utils/widgets/common";

const ALMExtensionIframeDialog: React.FC<{
  onClose: Function;
  href: string;
  classes: string;
  onProceed: Function;
  width?: string;
  height?: string;
  extension: PrimeExtension;
  action: string;
}> = (props: any) => {
  const { onClose, href, classes, onProceed, width, height, extension, action } = props;
  const showDialog = useRef(false);
  const { locale } = useIntl();
  const themeData = getALMConfig()?.themeData;
  useEffect(() => {
    if (!showDialog.current) {
      const launchDialog = document.getElementById("showAlert") as HTMLElement;
      launchDialog.click();
      showDialog.current = true;
      sendEvent(PrimeEvent.ALM_DISABLE_NAV_CONTROLS);
      const dialog = document.getElementsByClassName("extensionDialog")[0];
      const parentElement = (dialog as HTMLElement).parentElement as HTMLElement;
      const isMobileOrTableView = isScreenBelowDesktop();
      if (width && height && parentElement) {
        // For below desktop set Ifram width and height to 90% of screen
        parentElement.style.width = `${isMobileOrTableView ? 90 : width}%`;
        parentElement.style.maxWidth = `${isMobileOrTableView ? 90 : width}%`;
        parentElement.style.height = `${isMobileOrTableView ? 90 : height}%`;
        parentElement.style.maxHeight = `${isMobileOrTableView ? 90 : height}%`;
      }
      if (themeData) {
        parentElement.style.backgroundColor = getModalBackgroundColor(themeData.name);
      }
    }
  }, [showDialog, props]);

  useEffect(() => {
    const handleMessageFromIframe = (event: any) => {
      if (event.data && event.data.type === "ALM_EXTENSION_APP") {
        if (event.data.extToken) {
          const tokenObject = getParsedJwt(event.data.extToken);
          if (tokenObject?.invokePoint === InvocationType.LEARNER_ENROLL) {
            if (tokenObject.extResult == 1) {
              showDialog.current = false;
              typeof onProceed === "function" && onProceed(event.data.extToken);
              return;
            }
            hideDialog(tokenObject.extError);
            return;
          }
        }
        hideDialog(null);
      }
    };

    window.addEventListener("message", handleMessageFromIframe);

    return () => {
      window.removeEventListener("message", handleMessageFromIframe);
    };
  }, []);

  const hideDialog = (message: string | null = "") => {
    showDialog.current = false;
    sendEvent(PrimeEvent.ALM_ENABLE_NAV_CONTROLS);
    setTimeout(() => {
      typeof onClose === "function" && onClose(message);
    }, 0);
  };
  const extensionLocalizedMetadata = useMemo(() => {
    if (!extension) {
      return {} as any;
    }
    return getPreferredLocalizedMetadata(extension.localizedMetadata, locale);
  }, [extension, locale]);

  return (
    <Provider theme={getModalTheme(themeData?.name)} colorScheme={"light"}>
      {extension && (
        <>
          <ActionButton
            id="showAlert"
            UNSAFE_className={styles.primeAlertDialogButton}
          ></ActionButton>
          <DialogContainer onDismiss={hideDialog} isDismissable={true}>
            <Dialog UNSAFE_className={`${classes} ${styles.extensionDialogContainer}`}>
              <Heading>{extensionLocalizedMetadata.label}</Heading>
              <Divider />
              <Content>
                <iframe src={href} className={styles.iframe}></iframe>
              </Content>
            </Dialog>
          </DialogContainer>
        </>
      )}
    </Provider>
  );
};

export default ALMExtensionIframeDialog;
