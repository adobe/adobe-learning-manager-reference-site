import {
    ActionButton,
    DialogTrigger,
    Provider,
    lightTheme
  } from "@adobe/react-spectrum";
import { getUploadInfo } from "../../../utils/uploadUtils";
import { PrimeCommunityAddPostDialog } from "../PrimeCommunityAddPostDialog";
import styles from "./PrimeCommunityAddPostDialogTrigger.module.css";
import { useRef, useEffect } from "react";
  
const PrimeCommunityAddPostDialogTrigger = (props: any) => {
    const showDialog = useRef(false);
    useEffect(() => {
        if(props.openDialog && !showDialog.current) {
            const launchDialog = document.getElementById("hiddenActionButton") as HTMLElement;
            launchDialog.click();
            showDialog.current = true;
        }
    });
    
    const closeDialogHandler = (close: any) => {
        if(typeof props.closeDialogHandler === 'function') {
            props.closeDialogHandler();
        }
        close();
    }

    const savePostHandler = (event: any, input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any, close: any) => {
        if(typeof props.savePostHandler === 'function') {
            props.savePostHandler(input, postingType, resource, isResourceModified, pollOptions);
        }
        close();
    }

    const onClickHandler = () => {
        getUploadInfo();
    }

    return (
        <Provider theme={lightTheme} colorScheme={"light"}>
            <DialogTrigger>
                {
                    props.openDialog ? 
                    <ActionButton id="hiddenActionButton" UNSAFE_className={styles.primeHiddenDialogLaunchButton} onPress={onClickHandler}></ActionButton>
                    :
                    <ActionButton id="showAddPostDialog" UNSAFE_className={styles.primeDialogLaunchButton} onPress={onClickHandler}>{props.buttonLabel}</ActionButton>
                }
                {(close: any) => (
                    <PrimeCommunityAddPostDialog 
                        post={props.post}
                        mode={props.mode}
                        saveHandler={(event:any, input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any) => {
                            savePostHandler(event, input, postingType, resource, isResourceModified, pollOptions, close)}
                        } 
                        closeHandler={() => {closeDialogHandler(close)}}
                    ></PrimeCommunityAddPostDialog>
                )}
            </DialogTrigger>
        </Provider>
    );
  };
  
  export default PrimeCommunityAddPostDialogTrigger;
  