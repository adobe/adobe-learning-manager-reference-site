import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  Heading,
  ProgressBar,
  Text,
} from "@adobe/react-spectrum";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import {
  SOCIAL_CANCEL_SVG,
  SOCIAL_QUESTION_SVG,
  SOCIAL_TEXT_SVG,
  SOCIAL_UPLOAD_SVG,
} from "../../../utils/inline_svg";
import { cancelUploadFile, uploadFile } from "../../../utils/uploadUtils";
import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
import styles from "./PrimeCommunityAddPostDialog.module.css";

const PrimeCommunityAddPostDialog = (props: any) => {
  const ref = useRef<any>();
  const { formatMessage } = useIntl();
  const state = store.getState(); //TO-DO check why not updating
  const defaultPostingType = "DEFAULT";
  const questionPostingType = "QUESTION";
  const pollPostingType = "POLL";
  const supportedFileTypes =
    "image/*,video/*,audio/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx";
  const inputField = "uploadFile";
  const [postingType, setPostingType] = useState(defaultPostingType);
  const [questionTypeSelected, setQuestionTypeSelected] = useState(false);
  const [pollTypeSelected, setPollTypeSelected] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(true);
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );
  const [textMode, setTextMode] = useState(true);
  // const [ uploadedFileUrl, setUploadedFileUrl ] = useState("");
  const COMMENT_CHAR_LIMIT = 4000;
  // let post = {
  //   data: "",
  //   postingType: "",
  //   fileName: ""
  // };
  // const [ existingPost, setExistingPost ] = useState(post);
  const [resource, setResource] = useState({});
  const [isResourceModified, setIsResourceModified] = useState(false);

  useEffect(() => {
    if (props.mode === "update") {
      setPostingType(props.post?.postingType);
      if (props.post?.resource?.sourceUrl) {
        state.fileUpload.fileName = getFileNameFromSourceUrl(
          props.post?.resource?.sourceUrl
        );

        setResource(props.post?.resource);
        setFileUploadProgress(100);
        setTextMode(false);
      } else {
        state.fileUpload.fileName = "";
        setTextMode(true);
      }
      if (props.post.postingType === "QUESTION") {
        setQuestionTypeSelected(true);
      } else if (props.post.postingType === "POLL") {
        setPollTypeSelected(true);
      }
    }
  }, [props.mode, props.post]);

  useEffect(() => {
    if (questionTypeSelected) {
      setPostingType(questionPostingType);
    } else if (pollTypeSelected) {
      setPostingType(pollPostingType);
    } else {
      setPostingType(defaultPostingType);
    }
  }, [questionTypeSelected, pollTypeSelected, textMode]);

  const questionButtonClickHandler = () => {
    setQuestionTypeSelected((questionTypeSelected) => !questionTypeSelected);
  };

  const pollButtonClickHandler = () => {
    setPollTypeSelected((pollTypeSelected) => !pollTypeSelected);
  };

  const closeDialogHandler = (close: any) => {
    if (typeof props.closeHandler === "function") {
      props.closeHandler(close);
    }
  };

  const savePostHandler = (close: any) => {
    if (typeof props.saveHandler === "function") {
      props.saveHandler(close, ref.current.value, postingType, resource, isResourceModified);
      onExitActions();
    }
  };

  const fileUploadClickHandler = () => {
    document.getElementById(inputField)?.click();
  };

  const updateFileUpdateProgress = (value?: number) => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  const preUploadChecks = () => {
    setSaveEnabled(false);
    setTextMode(false);
  };

  const upload = async () => {
    const progressCheck = setInterval(() => {
      updateFileUpdateProgress();
    }, 500);
    const inputElement = document.getElementById(
      inputField
    ) as HTMLInputElement;
    const fileUrl = await uploadFile(
      inputElement!.files!.item(0)!.name,
      inputElement!.files!.item(0)!
    );
    const resource = {
      contentType: "FILE",
      data: fileUrl,
    };
    setResource(resource);
    setIsResourceModified(true);
    clearInterval(progressCheck);
  };

  const postUploadChecks = () => {
    setFileUploadProgress(100);
    setSaveEnabled(true);
  };

  const fileUploadHandler = async () => {
    preUploadChecks();
    await upload();
    postUploadChecks();
  };

  const cancelClickHandler = () => {
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsResourceModified(true);
    onExitActions();
  };

  const onExitActions = () => {
    setResource({});
    setTextMode(true);
  }
  const getFileNameFromSourceUrl = (url: any) => {
    const urlParts = url?.split("/");
    return urlParts[urlParts.length - 1].split("?")[0];
  };

  return (
    <Dialog UNSAFE_className={styles.primeConfirmationDialog}>
      <Heading>
        <div className={styles.primeDialogHeaderContainer}>
          <button className={styles.primeDialogHeader}>
            <div className={styles.primeDialogHeaderSvg}>
              {SOCIAL_TEXT_SVG()}
            </div>
            <div className={styles.primeDialogHeaderText}>Text</div>
          </button>
          <button
            className={styles.primeDialogHeader}
            onClick={fileUploadClickHandler}
          >
            <div className={styles.primeDialogHeaderSvg}>
              {SOCIAL_UPLOAD_SVG()}
              <input
                className={styles.primeFileUploadInput}
                type="file"
                id={inputField}
                onChange={fileUploadHandler}
                accept={supportedFileTypes}
              ></input>
            </div>
            <div className={styles.primeDialogHeaderText}>
              {formatMessage({
                id: "prime.community.upload.label",
                defaultMessage: "Upload",
              })}
            </div>
          </button>
        </div>
      </Heading>
      <Content>
        <PrimeCommunityObjectInput
          ref={ref}
          inputPlaceholder={formatMessage({
            id: "prime.community.postHere.label",
            defaultMessage: "Write or paste something here...",
          })}
          characterLimit={COMMENT_CHAR_LIMIT}
          defaultValue={props.post?.richText}
        ></PrimeCommunityObjectInput>
        {textMode && (
          <div>
            <div>
              <Text>
                <div className={styles.primeOptionContainer}>
                  {questionTypeSelected ? (
                    <div
                      className={styles.primeOption}
                      onClick={questionButtonClickHandler}
                    >
                      <div className={styles.primeOptionSvgFilled}>
                        {SOCIAL_QUESTION_SVG()}
                      </div>
                      <div className={styles.primeOptionTextFilled}>
                        {formatMessage({
                          id: "prime.community.markQuestion.label",
                          defaultMessage: "Mark Question",
                        })}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.primeOption}
                      onClick={questionButtonClickHandler}
                    >
                      <div className={styles.primeOptionSvg}>
                        {SOCIAL_QUESTION_SVG()}
                      </div>
                      <div className={styles.primeOptionText}>
                        {formatMessage({
                          id: "prime.community.markQuestion.label",
                          defaultMessage: "Mark Question",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Text>
            </div>
            {/* <div>
              <Text>
                <div className={styles.primeOptionContainer}>
                  {pollTypeSelected ?
                    <div className={styles.primeOption} onClick={pollButtonClickHandler}>
                      <div className={styles.primeOptionSvgFilled}>
                        {SOCIAL_POLL_SVG()}
                      </div>
                      <div className={styles.primeOptionTextFilled}>
                        {formatMessage({id: "prime.community.addPoll.label",defaultMessage: "Add Poll"})}
                      </div>
                    </div>
                    :
                    <div className={styles.primeOption} onClick={pollButtonClickHandler}>
                      <div className={styles.primeOptionSvg}>
                        {SOCIAL_POLL_SVG()}
                      </div>
                      <div className={styles.primeOptionText}>
                        {formatMessage({id: "prime.community.addPoll.label",defaultMessage: "Add Poll"})}
                      </div>
                    </div>
                  }
                </div>
              </Text>
            </div> */}
          </div>
        )}
        {!textMode && !saveEnabled && (
          <div>
            <ProgressBar
              label={formatMessage({
                id: "prime.community.uploading.label",
                defaultMessage: "Uploading...",
              })}
              value={fileUploadProgress}
            />
          </div>
        )}
        {!textMode && saveEnabled && (
          <div className={styles.primeStatus}>
            <div className={styles.primeStatusText}>
              Uploaded: {state.fileUpload.fileName}
            </div>
            <button
              className={styles.primeStatusSvg}
              title={formatMessage({
                id: "prime.community.removeUpload.label",
                defaultMessage: "Remove upload",
              })}
              onClick={cancelClickHandler}
            >
              {SOCIAL_CANCEL_SVG()}
            </button>
          </div>
        )}
      </Content>
      <ButtonGroup>
        <Button
          variant="secondary"
          onPress={(close) => {
            closeDialogHandler(close);
          }}
        >
          {formatMessage({
            id: "prime.community.cancel.label",
            defaultMessage: "Cancel",
          })}
        </Button>
        {saveEnabled ? (
          <Button
            variant="cta"
            onPress={(close) => {
              savePostHandler(close);
            }}
          >
            {formatMessage({
              id: "prime.community.post.label",
              defaultMessage: "Post",
            })}
          </Button>
        ) : (
          <Button variant="cta" isDisabled={true}>
            {formatMessage({
              id: "prime.community.post.label",
              defaultMessage: "Post",
            })}
          </Button>
        )}
      </ButtonGroup>
    </Dialog>
  );
};

export default PrimeCommunityAddPostDialog;
