import React from "react";
import styles from "./AlertDialog.module.css";
import Alert from "@spectrum-icons/workflow/Alert";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";

const success = "success";
const error = "error";

export enum AlertType {
  success = "success",
  error = "error",
}

export const renderAlert = (type: AlertType) => {
  switch (AlertType[type]) {
    case success:
      return (
        <CheckmarkCircleOutline UNSAFE_className={`${styles.alertIcon} ${styles.success}`} />
      );
      break;
    case error:
      return <Alert UNSAFE_className={`${styles.alertIcon} ${styles.error}`} />;
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
