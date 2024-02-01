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
import AlertCircle from "@spectrum-icons/workflow/AlertCircle";
import { Tooltip } from "@adobe/react-spectrum";

import styles from "./ALMTooltip.module.css";

const ALMTooltip: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <span className={styles.showOnHover}>
      <AlertCircle />
      <span className={styles.tooltip}>
        <Tooltip
          showIcon={true}
          placement={"bottom"}
          UNSAFE_className={styles.almTooltip}
          isOpen = {true}
        >
          {message}
        </Tooltip>
      </span>
    </span>
  );
};

export default ALMTooltip;
