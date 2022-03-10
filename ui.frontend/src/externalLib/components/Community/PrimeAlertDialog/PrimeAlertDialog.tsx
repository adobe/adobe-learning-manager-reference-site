import {
    ActionButton,
    DialogTrigger,
    Provider,
    lightTheme,
    AlertDialog
  } from "@adobe/react-spectrum";
import { useEffect, useRef } from "react";
import styles from "./PrimeAlertDialog.module.css";
  
const PrimeAlertDialog = (props: any) => {
    const showDialog = useRef(false);

    useEffect(() => {
        if(!showDialog.current) {
            const launchDialog = document.getElementById("showAlert") as HTMLElement;
            launchDialog.click();
            showDialog.current = true;
        }
    });

    const hideDialog = () => {
        showDialog.current = false;
    }
    const onPrimaryActionHandler = () => {
        hideDialog();
        if(typeof props.onPrimaryAction === 'function') {
            props.onPrimaryAction();
        }
    }

    const onSecondaryActionHandler = () => {
        hideDialog();
        if(typeof props.onSecondaryAction === 'function') {
            props.onSecondaryAction();
        }
    }

    return (
        <Provider theme={lightTheme} colorScheme={"light"}>
            <DialogTrigger>
                <ActionButton id="showAlert" UNSAFE_className={styles.primeAlertDialogButton}></ActionButton>
                <AlertDialog
                    variant={props.variant}
                    title={props.title}
                    primaryActionLabel={props.primaryActionLabel}
                    onPrimaryAction={onPrimaryActionHandler}
                    secondaryActionLabel={props.secondaryActionLabel}
                    onSecondaryAction={onSecondaryActionHandler}
                    autoFocusButton="primary"
                >{props.body}
                </AlertDialog>
            </DialogTrigger>
        </Provider>
    );
  };
  
  export default PrimeAlertDialog;
