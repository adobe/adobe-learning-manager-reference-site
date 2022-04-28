// import css from "classnames"
import React from "react";
import styles from "./AlertDialog.module.css";

const AlertDialog: React.FC<{
  icon: string;
  show: boolean;
  message: string;
}> = ({ icon, show, message }) => {
  debugger;
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
