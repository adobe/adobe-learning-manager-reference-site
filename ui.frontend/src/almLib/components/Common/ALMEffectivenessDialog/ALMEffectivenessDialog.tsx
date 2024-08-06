import {
  ActionButton,
  Heading,
  Divider,
  Content,
  Provider,
  lightTheme,
} from "@adobe/react-spectrum";
import { DialogContainer, Dialog } from "@react-spectrum/dialog";
import styles from "./ALMEffectivenessDialog.module.css";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { PrimeLearningObject } from "../../../models";
import {
  GetTranslation,
  GetTranslationReplaced,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import effectivenessImage from "../../../assets/images/effectiveness.png";
import { sendEvent } from "../../../utils/global";
import { PrimeEvent } from "../../../utils/widgets/common";

const ALMEffectivenessDialog: React.FC<{
  onClose: Function;
  training: PrimeLearningObject;
}> = ({ onClose, training }) => {
  const showDialog = useRef(false);
  const { locale } = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const { loType, effectivenessData } = training;
  useEffect(() => {
    if (!showDialog.current) {
      const launchDialog = document.getElementById("showAlert") as HTMLElement;
      launchDialog.click();
      showDialog.current = true;
      sendEvent(PrimeEvent.ALM_DISABLE_NAV_CONTROLS);
    }
  }, [showDialog]);

  const helperText = useMemo(() => {
    const effectivenessMeaningString = GetTranslation(`effectiveness.meaning.${loType}`, true);

    if (!effectivenessData) {
      return effectivenessMeaningString;
    }
    const { L1, totalCompletions } = JSON.parse(effectivenessData);

    if (!L1) {
      return effectivenessMeaningString;
    }

    let completions = 0;
    const { distribution } = L1;
    for (var i = 5; i > 0; i--) {
      completions += distribution[i] || 0;
    }
    const L1UsersFeedbackPercent = Math.floor(
      totalCompletions ? (completions / totalCompletions) * 100 : 0
    );
    if (L1UsersFeedbackPercent) {
      return `${GetTranslationReplaced(`effectiveness.details.${loType}`, L1UsersFeedbackPercent.toString(), true)}
         ${effectivenessMeaningString}`;
    }
    return effectivenessMeaningString;
  }, [effectivenessData, loType]);

  const hideDialog = () => {
    showDialog.current = false;
    sendEvent(PrimeEvent.ALM_ENABLE_NAV_CONTROLS);
    setTimeout(() => {
      typeof onClose === "function" && onClose();
    }, 0);
  };
  const headingKey = `effectiveness.heading.${loType}`;
  const { name } = getPreferredLocalizedMetadata(training.localizedMetadata, locale);

  const effectiveCalculationKey = `effectiveness.calculation.${loType}`;
  const isEffectivenessCalculated = training.effectivenessIndex ? true : false;
  const effectivenessDescriptionKey = `effectiveness.desc.${loType}`;

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <>
        <ActionButton
          id="showAlert"
          UNSAFE_className={styles.primeAlertDialogButton}
        ></ActionButton>
        <DialogContainer onDismiss={hideDialog} isDismissable={true}>
          <Dialog UNSAFE_className={styles.effectivenessDialog}>
            <Heading>{GetTranslation(headingKey, true)}</Heading>
            <Divider />
            <Content>
              <p className={styles.effectivenessDetails}>
                {name} | {GetTranslation(headingKey, true)}:{" "}
                {isEffectivenessCalculated
                  ? training.effectivenessIndex
                  : GetTranslation("text.notRated")}
              </p>
              <p className={styles.effectivenessHelpText}>{helperText}</p>
              <div className={styles.flex}>
                <a
                  className={styles.effectivenessCalculationText}
                  onClick={() => setIsExpanded(value => !value)}
                  tabIndex={0}
                  href="javascript:void(0)"
                >
                  {GetTranslation(effectiveCalculationKey, true)}
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </a>
              </div>
              {isExpanded && (
                <>
                  <div className={styles.effectivenessDescription}>
                    <p>{GetTranslation(effectivenessDescriptionKey, true)}</p>
                  </div>
                  <div className={styles.pieChartContainer}>
                    <img
                      className={styles.pieChart}
                      alt={GetTranslation("alm.effectiveness.image.chart")}
                      src={effectivenessImage}
                    />
                    <div className={styles.pieChartHelper}>
                      <p className={styles.pieChartHelpText}>
                        {GetTranslation("effectiveness.type.L1", true)}
                      </p>
                      <p className={styles.pieChartHelpText}>
                        {GetTranslation("effectiveness.type.L2")}
                      </p>
                      <p className={styles.pieChartHelpText}>
                        {GetTranslation("effectiveness.type.L3")}
                      </p>
                    </div>
                  </div>
                  <p className={styles.effectivenessHelpText}>
                    {GetTranslation("effectiveness.AllTypes", true)}
                  </p>
                </>
              )}
            </Content>
          </Dialog>
        </DialogContainer>
      </>
    </Provider>
  );
};

export default ALMEffectivenessDialog;
