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
import { useIntl } from "react-intl";
import { isUrl } from "../../utils/global";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import styles from "./ALMFooter.module.css";
import { PrimeExtension } from "../../models";
import {
  EXTENSION_LAUNCH_TYPE,
  InvocationType,
  openExtensionInNewTab,
  openExtensionInSameTab,
  openLink,
} from "../../utils/native-extensibility";
import { useState } from "react";
import { ALMExtensionIframeDialog } from "../Common/ALMExtensionIframeDialog";

const ALMFooter = (props: any) => {
  const { locale } = useIntl();
  const [activeExtension, setActiveExtension] = useState<PrimeExtension>();
  const [extensionAppIframeUrl, setExtensionAppIframeUrl] = useState("");

  const linkClickHandler = (footerData: any) => {
    let link = (getPreferredLocalizedMetadata(footerData, locale) as any).link;
    link = isUrl(link) ? link : "mailto:" + link;
    openLink(link, "_blank");
  };

  const extensionClickHandler = (extension: PrimeExtension) => {
    const launchType = extension.launchType;
    const url = extension.url;
    if (launchType === EXTENSION_LAUNCH_TYPE.IN_APP) {
      setExtensionAppIframeUrl(url);
    } else if (launchType === EXTENSION_LAUNCH_TYPE.SAME_TAB) {
      openExtensionInSameTab(url);
    } else if (launchType === EXTENSION_LAUNCH_TYPE.NEW_TAB) {
      openExtensionInNewTab(url);
      setActiveExtension(undefined);
    }
  };

  const iframeCloseHandler = () => {
    setExtensionAppIframeUrl("");
    setActiveExtension(undefined);
  };

  const accountData = props.accountJson?.accountData;
  const learnerHelpLinks = accountData
    ? JSON.parse(accountData).data.attributes.learnerHelpLinks
    : props.learnerHelpLinks;

  const extensions = props.nativeExtensions as PrimeExtension[];
  let footerDataRows = [];

  if (learnerHelpLinks) {
    for (let i = 0; i < learnerHelpLinks.length; i++) {
      footerDataRows.push(learnerHelpLinks[i].localizedHelpLink);
    }
  }
  if (extensions && !activeExtension) {
    for (let i = 0; i < extensions.length; i++) {
      if (extensions[i].invocationType === InvocationType.LEARNER_FOOTER) {
        setActiveExtension(extensions[i]);
        break;
      }
    }
  }

  const getSeparator = () => {
    return (
      <span className={props.learnerHelpLinks ? styles.marginOnly : styles.footerSeparator}></span>
    );
  };

  const getFooterLabel = (footerData: any) => {
    return (getPreferredLocalizedMetadata(footerData, locale) as any).name;
  };

  const getButtonStyle = () => {
    return props.disableLinks ? styles.helpButtonDisabled : styles.helpButton;
  };

  return (
    <div className={styles.header}>
      <div className={styles.footer}>
        <div className={styles.footerMenu}>
          {footerDataRows?.map(footerData => (
            <>
              <button
                className={getButtonStyle()}
                onClick={() => {
                  linkClickHandler(footerData);
                }}
                disabled={props.disableLinks}
              >
                {getFooterLabel(footerData)}
              </button>
              {getSeparator()}
            </>
          ))}
          {activeExtension && (
            <button
              className={getButtonStyle()}
              onClick={() => {
                extensionClickHandler(activeExtension);
              }}
              disabled={props.disableLinks}
            >
              {getFooterLabel(activeExtension.localizedMetadata)}
            </button>
          )}
        </div>
      </div>
      {activeExtension && extensionAppIframeUrl?.length ? (
        <ALMExtensionIframeDialog
          href={extensionAppIframeUrl}
          classes="extensionDialog"
          onClose={iframeCloseHandler}
          onProceed={iframeCloseHandler}
          action={InvocationType.LEARNER_FOOTER}
          width={`${activeExtension.width}`}
          height={`${activeExtension.height}`}
          extension={activeExtension}
        ></ALMExtensionIframeDialog>
      ) : (
        ""
      )}
    </div>
  );
};

export default ALMFooter;
