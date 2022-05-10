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
// import css from "classnames"
import React from "react";
import styles from "./AlertDialog.module.css";

const AlertDialog: React.FC<{
  icon: string;
  show: boolean;
  message: string;
}> = ({ icon, show, message }) => {
  return (
    <>
      {show && (
        <div className={styles.modal}>
          <div className={styles.modalcontent}>
            {/* <div className={css(styles.alert, styles[icon])}>{message}</div> */}
          </div>
        </div>
      )}
    </>
  );
};
export default AlertDialog;
