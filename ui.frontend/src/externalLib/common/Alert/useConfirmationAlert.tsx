import { useEffect, useState } from "react";
import { render } from "react-dom";
import { PrimeAlertDialog } from "../../components/Community/PrimeAlertDialog";

let alertTitle: String;
let alertBody: String;
let alertPrimaryActionLabel: String;
let alertSecondaryActionLabel: String;
let primaryActionHandler: Function;
let secondaryActionHandler: Function;

const useConfirmationAlert = (): [
  (
    title: String,
    body: String,
    primaryActionLabel: String,
    secondaryActionLabel?: String,
    onPrimaryAction?: Function,
    onSecondaryAction?: Function
  ) => void
] => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const almConfirmationAlert = (
    title: String,
    body: String,
    primaryActionLabel: String,
    secondaryActionLabel?: String,
    onPrimaryAction?: Function,
    onSecondaryAction?: Function
  ) => {
    alertTitle = title;
    alertBody = body;
    alertPrimaryActionLabel = primaryActionLabel;
    alertSecondaryActionLabel = secondaryActionLabel || "";
    primaryActionHandler = onPrimaryAction || function () {};
    secondaryActionHandler = onSecondaryAction || function () {};
    setShowConfirmation(true);
  };

  const onPrimaryActionHandler = () => {
    setShowConfirmation(false);
    if (typeof primaryActionHandler === "function") {
      primaryActionHandler();
    }
  };

  const onSecondaryActionHandler = () => {
    setShowConfirmation(false);
    if (typeof secondaryActionHandler === "function") {
      secondaryActionHandler();
    }
  };

  const alertTemplate = () => {
    return (
      <PrimeAlertDialog
        variant="confirmation"
        title={alertTitle}
        body={alertBody}
        primaryActionLabel={alertPrimaryActionLabel}
        secondaryActionLabel={alertSecondaryActionLabel}
        onPrimaryAction={onPrimaryActionHandler}
        onSecondaryAction={onSecondaryActionHandler}
        show={showConfirmation}
      ></PrimeAlertDialog>
    );
  };

  useEffect(() => {
    render(alertTemplate(), document.getElementById("alertDialog"));
  }, [showConfirmation]);

  return [almConfirmationAlert];
};

export { useConfirmationAlert };
