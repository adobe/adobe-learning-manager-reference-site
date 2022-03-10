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
        onPress={() => window.history.back()}
      >
        <ChevronLeft></ChevronLeft>
        <span className={styles.buttonLabel}>
          {formatMessage({
            id: "prime.community.back.label",
            defaultMessage: "Back",
          })}
        </span>
      </Button>
    </div>
  );
};

export default ALMBackButton;
