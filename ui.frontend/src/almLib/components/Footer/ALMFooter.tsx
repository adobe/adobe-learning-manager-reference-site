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

const ALMFooter = (props: any) => {
  const { locale } = useIntl();
  const linkClickHandler = (footerData: any) => {
    let link = (getPreferredLocalizedMetadata(footerData, locale) as any).link;
    link = isUrl(link) ? link : "mailto:" + link;
    window.open(link, "_blank");
  };

  const accountData = props.accountJson.accountData;
  const learnerHelpLinks =
    JSON.parse(accountData).data.attributes.learnerHelpLinks;

  let footerDataRows = [];
  for (let i = 0; i < learnerHelpLinks.length; i++) {
    footerDataRows.push(learnerHelpLinks[i].localizedHelpLink);
  }

  const getSeparator = () => {
    return <span className={styles.footerSeparator}>|</span>;
  };

  const getFooterLabel = (footerData: any) => {
    return (getPreferredLocalizedMetadata(footerData, locale) as any).name;
  };

  return (
    <div className={styles.header}>
      <div className={styles.footer}>
        <div className={styles.footerMenu}>
          {footerDataRows?.map((footerData) => (
            <>
              <button
                className={styles.helpButton}
                onClick={() => {
                  linkClickHandler(footerData);
                }}
              >
                {getFooterLabel(footerData)}
              </button>
              {getSeparator()}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ALMFooter;
