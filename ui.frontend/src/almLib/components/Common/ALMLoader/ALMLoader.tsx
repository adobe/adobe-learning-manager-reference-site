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
import loadingImage from "../../../assets/images/LoadingButton.gif";
import { getALMConfig } from "../../../utils/global";

import styles from "./ALMLoader.module.css";

const ALMLoader: React.FC<{ classes?: string }> = ({ classes = "" }) => {
  const { formatMessage } = useIntl();
  const loadingContainerClass = `${styles.loadingContainer} ${classes}`;
  const customLoaderImage = getALMConfig().customLoaderImage;
  return (
    <section className={loadingContainerClass}>
      <img
        src={customLoaderImage || loadingImage}
        className={styles.loaderImage}
        alt={formatMessage({
          id: "alm.loading.label",
          defaultMessage: "Loading",
        })}
      ></img>
    </section>
  );
};

export default ALMLoader;
