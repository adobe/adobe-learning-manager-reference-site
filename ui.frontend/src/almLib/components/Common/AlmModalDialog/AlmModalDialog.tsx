import { useEffect } from "react";
import { GetPrimeEmitEventLinks } from "../../../utils/global";
import { SendMessageToParent } from "../../../utils/widgets/base/EventHandlingBase";
import { PrimeEvent } from "../../../utils/widgets/common";
import styles from "./AlmModalDialog.module.css";
import { GetTranslation } from "../../../utils/translationService";
import { CROSS_ICON } from "../../../utils/inline_svg";

const AlmModalDialog: React.FC<{
  title: string;
  showCrossButton: boolean;
  showCloseButton: boolean;
  body: any;
  closeDialog?: () => void;
}> = props => {
  const { title, showCloseButton, showCrossButton, body, closeDialog } = props;
  const connectedCallback = () => {
    SendMessageToParent({ type: PrimeEvent.MODAL_DIALOG_LAUNCHED }, GetPrimeEmitEventLinks());
  };
  useEffect(() => {
    connectedCallback();
  }, []);
  return (
    <div className={`${styles.modalDialogOverlay} ${styles.modalFadeIn}`} tabIndex={-1}>
      <div className={styles.modalDialog}>
        <div className={styles.modalDialogContent}>
          <div className={styles.modalDialogHeader}>
            {showCrossButton && (
              <div className={styles.modalDialogCloseButton}>
                <button className={styles.modalCloseButton} onClick={closeDialog}>
                  {CROSS_ICON()}
                </button>
              </div>
            )}
            <div className={styles.modalTitle}>{title}</div>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.modalBootstrapDialogBody}>{body}</div>
          </div>
          <div className={styles.modalFooter}>
            {showCloseButton && (
              <div className={styles.modalBootstrapDialogBody}>
                <div>
                  <button
                    className={styles.modalPrimaryButton}
                    id="close"
                    data-automationid="close"
                    onClick={closeDialog}
                  >
                    <div>{GetTranslation("text.ok")}</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlmModalDialog;
