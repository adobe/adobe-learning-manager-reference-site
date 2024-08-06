import { useEffect, useState } from "react";
import { render } from "react-dom";
import { AlertDialog, AlertType } from "./AlertDialog";

let alertMesssage: string = "Unknown Error";
let alertType: "success" | "error";

const useAlert = (): [
  (show: boolean, messsage: string, type: AlertType, timeOut?: number) => void,
] => {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const almAlert = (show: boolean, messsage: string, type: AlertType, timeOut: number = 3000) => {
    alertType = type;
    alertMesssage = messsage;
    setShowAlert(show);
    setTimeout(() => {
      setShowAlert(false);
    }, timeOut);
  };
  const alertTemplate = () => {
    return <AlertDialog type={alertType} show={showAlert} message={alertMesssage}></AlertDialog>;
  };

  useEffect(() => {
    render(alertTemplate(), document.getElementById("alertDialog"));
  }, [showAlert]);
  return [almAlert];
};

export { useAlert };
