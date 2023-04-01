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
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";
import { Button } from "@adobe/react-spectrum";

import styles from "./ALMBackButton.module.css";

const ALMBackButton = () => {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.backContainer}>
      <Button
        variant="primary"
        isQuiet
        UNSAFE_className={styles.backButton}
        onPress={() => window.history.back()}>
        <ChevronLeft></ChevronLeft>
        <span className={styles.buttonLabel}>
          {formatMessage({
            id: "alm.community.back.label",
            defaultMessage: "Back",
          })}
        </span>
      </Button>
    </div>
  );
};

export default ALMBackButton;
