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
import React from "react";
import styles from "./AlertDialog.module.css";
import Alert from "@spectrum-icons/workflow/Alert";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";

export enum AlertType {
  success = "success",
  error = "error",
}

export const renderAlert = (type: AlertType) => {
  switch (AlertType[type]) {
    case "success":
      return (
        <CheckmarkCircleOutline UNSAFE_className={styles.alertIconSuccess} />
      );
      break;
    case "error":
      return <Alert UNSAFE_className={styles.alertIconError} />;
      break;
  }
};
const AlertDialog: React.FC<{
  type: AlertType;
  show: boolean;
  message: string;
}> = ({ type, show, message }) => {
  return (
    <>
      {show && (
        <div className={styles.alertbackdrop}>
          <div className={`${styles.alert} ${styles.dialog}`}>
            <div className={styles.alertIconType}>{renderAlert(type)}</div>
            <div
              className={styles.alertMessage}
              role="alert"
              aria-atomic="true"
              aria-live="assertive"
            >
              {message}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export { AlertDialog };
