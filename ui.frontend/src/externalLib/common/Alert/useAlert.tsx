/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useEffect, useState } from "react";
import { render } from "react-dom";
import { AlertDialog, AlertType } from "./AlertDialog";

let alertMesssage: string = "Unknown Error";
let alertType: AlertType = AlertType.success;

const useAlert = (): [
  (show: boolean, timeOut: number, messsage: string, type: AlertType) => void
] => {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const alert = (
    show: boolean,
    timeOut: number = 2000,
    messsage: string,
    type: AlertType
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
