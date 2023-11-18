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
    body: any,
    primaryActionLabel: String,
    secondaryActionLabel?: String,
    onPrimaryAction?: Function,
    onSecondaryAction?: Function
  ) => void
] => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const almConfirmationAlert = (
    title: String,
    body: any,
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
    handleShowConfirmation(true);
  };

  const handleShowConfirmation = (value: boolean) => {
    setShowConfirmation(value);
    let backgroundEvent = new Event(value ? "almDisableBackground" : "almEnableBackground");
    document.dispatchEvent(backgroundEvent);
  }

  const onPrimaryActionHandler = () => {
    handleShowConfirmation(false);
    if (typeof primaryActionHandler === "function") {
      primaryActionHandler();
    }
  };

  const onSecondaryActionHandler = () => {
    handleShowConfirmation(false);
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
