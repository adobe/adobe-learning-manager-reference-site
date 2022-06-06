import React from "react";
import styles from "./AlertDialog.module.css";
import Alert from "@spectrum-icons/workflow/Alert";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";
import { lightTheme, Provider } from "@adobe/react-spectrum";

export enum AlertType {
  success = "success",
  error = "error",
}

export const renderAlert = (type: "success" | "error") => {
  switch (AlertType[type]) {
    case AlertType.success:
      return (
        <CheckmarkCircleOutline
          UNSAFE_className={`${styles.alertIcon} ${styles.success}`}
        />
      );
    case AlertType.error:
      return <Alert UNSAFE_className={`${styles.alertIcon} ${styles.error}`} />;
  }
};
const AlertDialog: React.FC<{
  type: "success" | "error";
  show: boolean;
  message: string;
}> = ({ type, show, message }) => {
  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
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
    </Provider>
  );
};
export { AlertDialog };
