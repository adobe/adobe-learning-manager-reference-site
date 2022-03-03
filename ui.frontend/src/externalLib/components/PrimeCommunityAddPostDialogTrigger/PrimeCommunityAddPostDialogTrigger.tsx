import {
    ActionButton,
    DialogTrigger,
    Provider,
    lightTheme
  } from "@adobe/react-spectrum";
import { getUploadInfo } from "../../utils/uploadUtils";
import { PrimeCommunityAddPostDialog } from "../PrimeCommunityAddPostDialog";
import styles from "./PrimeCommunityAddPostDialogTrigger.module.css";
  
const PrimeCommunityAddPostDialogTrigger = (props: any) => {
    const closeDialogHandler = (close: any) => {
        close();
    }

    const savePostHandler = (event: any, input: any, postingType: any, uploadedFileUrl: any, close: any) => {
        if(typeof props.savePostHandler === 'function') {
            props.savePostHandler(input, postingType, uploadedFileUrl);
        }
        close();
    }

    const onClickHandler = () => {
        getUploadInfo();
    }

    return (
        <Provider theme={lightTheme} colorScheme={"light"}>
            <DialogTrigger>
                <ActionButton UNSAFE_className={styles.primeDialogLaunchButton} onPress={onClickHandler}>{props.buttonLabel}</ActionButton>
                {(close: any) => (
                    <PrimeCommunityAddPostDialog 
                        saveHandler={(event:any, input: any, postingType: any, uploadedFileUrl: any) => {
                            savePostHandler(event, input, postingType, uploadedFileUrl, close)}
                        } 
                        closeHandler={() => {closeDialogHandler(close)}}
                    ></PrimeCommunityAddPostDialog>
                )}
            </DialogTrigger>
        </Provider>
    );
  };
  
  export default PrimeCommunityAddPostDialogTrigger;
  