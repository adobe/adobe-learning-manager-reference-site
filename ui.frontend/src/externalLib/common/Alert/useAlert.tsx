import { useEffect, useState } from "react";
import { render } from "react-dom";
import { AlertDialog, AlertType } from "./AlertDialog";

let alertMesssage: string = "Unknown Error";
let alertType: AlertType = AlertType.success;

const useAlert = (): [
  (show: boolean, messsage: string, type: AlertType, timeOut?: number) => void
] => {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const alert = (
    show: boolean,
    messsage: string,
    type: AlertType,
    timeOut: number = 2000,
  ) => {
    alertType = type;
    alertMesssage = messsage;
    setShowAlert(show);
    setTimeout(() => {
      setShowAlert(false);
    }, timeOut);
  };
  const alert_Template = (type: string, show: boolean, message: string) => {
    return (
      <AlertDialog
        type={alertType}
        show={show}
        message={alertMesssage}
      ></AlertDialog>
    );
  };

  useEffect(() => {
    render(
      alert_Template(alertType, showAlert, alertMesssage),
      document.getElementById("alertDialog")
    );
  }, [showAlert]);
  return [alert];
};

export { useAlert };
