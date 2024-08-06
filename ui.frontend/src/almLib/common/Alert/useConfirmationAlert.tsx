import { useEffect, useState } from "react";
import { render } from "react-dom";
import { PrimeAlertDialog } from "../../components/Community/PrimeAlertDialog";

export enum VariantType {
  CONFIRMATION = "confirmation",
  INFORMATION = "information",
  DESTRUCTIVE = "destructive",
  ERROR = "error",
  WARNING = "warning",
}

let alertTitle: String;
let alertBody: String;
let alertPrimaryActionLabel: String;
let alertSecondaryActionLabel: String;
let primaryActionHandler: Function;
let secondaryActionHandler: Function;
let variant: string;

const useConfirmationAlert = (): [
  (
    title: String,
    body: any,
    primaryActionLabel: String,
    secondaryActionLabel?: String,
    onPrimaryAction?: Function,
    onSecondaryAction?: Function,
    variantType?: string
  ) => void,
] => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const almConfirmationAlert = (
    title: String,
    body: any,
    primaryActionLabel: String,
    secondaryActionLabel?: String,
    onPrimaryAction?: Function,
    onSecondaryAction?: Function,
    variantType?: string
  ) => {
    alertTitle = title;
    alertBody = body;
    alertPrimaryActionLabel = primaryActionLabel;
    alertSecondaryActionLabel = secondaryActionLabel || "";
    primaryActionHandler = onPrimaryAction || function () {};
    secondaryActionHandler = onSecondaryAction || function () {};
    handleShowConfirmation(true);
    variant = variantType || VariantType.CONFIRMATION;
  };

  const handleShowConfirmation = (value: boolean) => {
    setShowConfirmation(value);
    let backgroundEvent = new Event(value ? "almDisableBackground" : "almEnableBackground");
    document.dispatchEvent(backgroundEvent);
  };

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
        variant={variant}
        title={alertTitle}
        body={alertBody}
        primaryActionLabel={alertPrimaryActionLabel}
        secondaryActionLabel={alertSecondaryActionLabel}
        onPrimaryAction={onPrimaryActionHandler}
        onSecondaryAction={onSecondaryActionHandler}
        show={showConfirmation}
        classes="confirmationAlert"
      ></PrimeAlertDialog>
    );
  };

  useEffect(() => {
    render(alertTemplate(), document.getElementById("alertDialog"));
  }, [showConfirmation]);

  return [almConfirmationAlert];
};

export { useConfirmationAlert };
