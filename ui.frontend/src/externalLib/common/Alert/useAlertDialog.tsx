import { useState } from "react";
const useAlert = (
  showAlert: boolean = false,
  alertMessage: string = "Unknown Error",
  icon: string = "error"
): [boolean, any, string, string] => {
  const [show, setShow] = useState<boolean>(showAlert);
  const [message, setMessage] = useState<string>(alertMessage);
  const [alertIcon, setAlertIcon] = useState<string>(icon);
  debugger;
  const alert = (
    show: boolean,
    timeOut: number,
    messsage: string,
    alertIcon: string
  ) => {
    setMessage(messsage);
    setShow(show);
    setAlertIcon(alertIcon);
    setTimeout(() => {
      setShow(false);
    }, timeOut);
  };
  return [show, alert, message, alertIcon];
};
export { useAlert };