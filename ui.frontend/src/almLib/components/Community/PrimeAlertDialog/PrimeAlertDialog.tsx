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
import {
  ActionButton,
  DialogTrigger,
  Provider,
  lightTheme,
  AlertDialog,
} from "@adobe/react-spectrum";
import { useEffect, useRef } from "react";
import styles from "./PrimeAlertDialog.module.css";

const PrimeAlertDialog = (props: any) => {
  const showDialog = useRef(false);
  let classes = ""
  if(props.classes){
    classes = `${props.classes} ${styles.dialogButton} `
  }
  
  useEffect(() => {
    if (!showDialog.current && props.show) {
      const launchDialog = document.getElementById("showAlert") as HTMLElement;
      launchDialog.click();
      showDialog.current = true;
    }
  }, [showDialog, props]);

  const hideDialog = () => {
    showDialog.current = false;
  };
  const onPrimaryActionHandler = () => {
    hideDialog();
    if (typeof props.onPrimaryAction === "function") {
      props.onPrimaryAction();
    }
  };

  const onSecondaryActionHandler = () => {
    hideDialog();
    if (typeof props.onSecondaryAction === "function") {
      props.onSecondaryAction();
    }
  };

  return (
    props.show && (
      <Provider theme={lightTheme} colorScheme={"light"}>
        <DialogTrigger>
          <ActionButton
            id="showAlert"
            UNSAFE_className={styles.primeAlertDialogButton}
          ></ActionButton>
          <AlertDialog
            variant={props.variant}
            title={props.title}
            primaryActionLabel={props.primaryActionLabel}
            onPrimaryAction={onPrimaryActionHandler}
            secondaryActionLabel={props.secondaryActionLabel}
            onSecondaryAction={onSecondaryActionHandler}
            autoFocusButton="primary"
            UNSAFE_className={classes}
          >
            {props.body}
          </AlertDialog>
        </DialogTrigger>
      </Provider>
    )
  );
};

export default PrimeAlertDialog;
