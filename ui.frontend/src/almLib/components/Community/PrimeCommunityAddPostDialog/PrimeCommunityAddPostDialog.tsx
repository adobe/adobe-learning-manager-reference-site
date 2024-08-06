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
  Button,
  ButtonGroup,
  Content,
  Dialog,
  Heading,
  ProgressBar,
  Text,
} from "@adobe/react-spectrum";
import Close from "@spectrum-icons/workflow/Close";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { POLL, QUESTION, UPDATE } from "../../../utils/constants";
import {
  SOCIAL_CANCEL_SVG,
  SOCIAL_QUESTION_SVG,
  SOCIAL_UPLOAD_SVG,
  SOCIAL_POLL_SVG,
} from "../../../utils/inline_svg";
import { cancelUploadFile, uploadFile } from "../../../utils/uploadUtils";
import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
import styles from "./PrimeCommunityAddPostDialog.module.css";

const PrimeCommunityAddPostDialog = (props: any) => {
  const ref = useRef<any>();
  const { formatMessage } = useIntl();
  const state = store.getState(); //TO-DO check why not updating
  const defaultPostingType = "DEFAULT";
  const supportedFileTypes = "image/*,video/*,audio/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx";
  const inputField = "uploadFile";
  const [postingType, setPostingType] = useState(defaultPostingType);
  const [questionTypeSelected, setQuestionTypeSelected] = useState(false);
  const [pollTypeSelected, setPollTypeSelected] = useState(false);

  const isInputFilled = () => {
    return ref?.current?.value?.trim() !== "" ? true : false;
  };

  const [saveEnabled, setSaveEnabled] = useState(isInputFilled());
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(state.fileUpload.uploadProgress);
  const [textMode, setTextMode] = useState(true);
  const [pollOptions, setPollOptions] = useState([] as any);
  const COMMENT_CHAR_LIMIT = 4000;
  const [resource, setResource] = useState({});
  const [isResourceModified, setIsResourceModified] = useState(false);

  useEffect(() => {
    if (props.mode === UPDATE) {
      setPostingType(props.post?.postingType);
      if (props.post?.resource?.sourceUrl) {
        state.fileUpload.fileName = getFileNameFromSourceUrl(props.post?.resource?.sourceUrl);
        setResource(props.post?.resource);
        setFileUploadProgress(100);
        setTextMode(false);
      } else if (textMode) {
        state.fileUpload.fileName = "";
      }
      if (props.post.postingType === QUESTION) {
        setQuestionTypeSelected(true);
      } else if (props.post.postingType === POLL) {
        setPollTypeSelected(true);
        let otherData = JSON.parse(props.post.otherData);
        let existingPollOptions = [] as any;
        otherData.map((object: any) => {
          return existingPollOptions.push(object.text);
        });
        setPollOptions(existingPollOptions);
      }
    }
  }, [props.mode, props.post, state.fileUpload]);

  useEffect(() => {
    if (questionTypeSelected) {
      setPostingType(QUESTION);
    } else if (pollTypeSelected) {
      setPostingType(POLL);
      if (pollOptions?.length === 0) {
        let pollQuestions = ["", ""];
        setPollOptions(pollQuestions);
      }
    } else {
      setPostingType(defaultPostingType);
    }
  }, [questionTypeSelected, pollTypeSelected, textMode]);

  const questionButtonClickHandler = () => {
    setQuestionTypeSelected(questionTypeSelected => !questionTypeSelected);
    setPollTypeSelected(false);
  };

  const pollButtonClickHandler = () => {
    setPollTypeSelected(pollTypeSelected => !pollTypeSelected);
    setQuestionTypeSelected(false);
  };

  const closeDialogHandler = (close: any) => {
    if (typeof props.closeHandler === "function") {
      props.closeHandler(close);
    }
  };

  const savePostHandler = (close: any) => {
    if (ref.current.value === "") {
      return;
    }
    if (typeof props.saveHandler === "function") {
      props.saveHandler(
        close,
        ref.current.value,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
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
    setIsUploading(true);
  };

  const upload = async () => {
    const progressCheck = setInterval(() => {
      updateFileUpdateProgress();
    }, 500);
    const inputElement = document.getElementById(inputField) as HTMLInputElement;
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
    setPostingType(defaultPostingType);
    clearInterval(progressCheck);
  };

  const postUploadChecks = () => {
    setFileUploadProgress(100);
    setIsUploading(false);
    setSaveEnabled(isInputFilled());
  };

  const fileUploadHandler = async () => {
    //if file empty
    const inputElement = document.getElementById(inputField) as HTMLInputElement;
    if (!inputElement!.files!.item(0) && !inputElement!.files!.item(0)!.name) {
      return;
    }
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
    setQuestionTypeSelected(false);
    setPollTypeSelected(false);
  };

  const getFileNameFromSourceUrl = (url: any) => {
    const urlParts = url?.split("/");
    return urlParts[urlParts.length - 1].split("?")[0];
  };

  const addNewPollOption = () => {
    let newOption = [""];
    setPollOptions(pollOptions.concat(newOption));
  };

  const removePollOption = (index: any) => {
    pollOptions.splice(index, 1);
    setPollOptions([]); //to-do check why without this polloptions was not updating
    setPollOptions(pollOptions);
  };

  const setInputValue = (index: any) => {
    const inputElement = document.getElementById("poll-option-" + index) as HTMLInputElement;
    pollOptions[index] = inputElement?.value ? inputElement.value : "";
    setPollOptions(pollOptions);
  };

  const enableSaveButton = () => {
    if (!isUploading) {
      setSaveEnabled(true);
    }
  };

  return (
    <Dialog UNSAFE_className={styles.primeConfirmationDialog}>
      <Heading>
        <div className={styles.primeDialogHeaderContainer}>
          <button className={styles.primeDialogHeader} onClick={fileUploadClickHandler}>
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
                id: "alm.community.upload.label",
                defaultMessage: "Upload",
              })}
            </div>
          </button>
        </div>
      </Heading>
      <Content UNSAFE_className={styles.primeOverflowStyle}>
        <PrimeCommunityObjectInput
          ref={ref}
          inputPlaceholder={formatMessage({
            id: "alm.community.postHere.label",
            defaultMessage: "Write or paste something here...",
          })}
          characterLimit={COMMENT_CHAR_LIMIT}
          defaultValue={props.description}
          enablePrimaryAction={() => {
            enableSaveButton();
          }}
          disablePrimaryAction={() => {
            setSaveEnabled(false);
          }}
          concisedToolbarOptions={false}
        ></PrimeCommunityObjectInput>
        {textMode && (
          <div className={styles.primeOptionsArea}>
            <div>
              <Text>
                <div className={styles.primeOptionContainer}>
                  {questionTypeSelected ? (
                    <div className={styles.primeOption} onClick={questionButtonClickHandler}>
                      <div className={styles.primeOptionSvgFilled}>{SOCIAL_QUESTION_SVG()}</div>
                      <div className={styles.primeOptionTextFilled}>
                        {formatMessage({
                          id: "alm.community.markQuestion.label",
                          defaultMessage: "Mark Question",
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.primeOption} onClick={questionButtonClickHandler}>
                      <div className={styles.primeOptionSvg}>{SOCIAL_QUESTION_SVG()}</div>
                      <div className={styles.primeOptionText}>
                        {formatMessage({
                          id: "alm.community.markQuestion.label",
                          defaultMessage: "Mark Question",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Text>
            </div>
            <div>
              <Text>
                <div className={styles.primeOptionContainer}>
                  {pollTypeSelected ? (
                    <div className={styles.primeOption} onClick={pollButtonClickHandler}>
                      <div className={styles.primeOptionSvgFilled}>{SOCIAL_POLL_SVG()}</div>
                      <div className={styles.primeOptionTextFilled}>
                        {formatMessage({
                          id: "alm.community.addPoll.label",
                          defaultMessage: "Add Poll",
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.primeOption} onClick={pollButtonClickHandler}>
                      <div className={styles.primeOptionSvg}>{SOCIAL_POLL_SVG()}</div>
                      <div className={styles.primeOptionText}>
                        {formatMessage({
                          id: "alm.community.addPoll.label",
                          defaultMessage: "Add Poll",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Text>
            </div>
            {pollTypeSelected &&
              pollOptions?.map((item: any, index: any) => (
                <div className={styles.primeCommunityPollInputContainer} key={index}>
                  <input
                    id={"poll-option-" + index}
                    className={styles.primeCommunityPollInput}
                    onKeyUp={() => setInputValue(index)}
                    defaultValue={item}
                    placeholder={formatMessage({
                      id: "alm.community.pollOptionPlaceholder",
                      defaultMessage: "Type Option here",
                    })}
                  ></input>
                  <Button
                    UNSAFE_className={styles.primeCommunityRemoveOption}
                    variant="primary"
                    // isQuiet
                    onPress={() => {
                      removePollOption(index);
                    }}
                  >
                    <Close aria-label="Close" />
                  </Button>
                </div>
              ))}
            {pollTypeSelected && (
              <button className={styles.primeCommunityAddOptionButton} onClick={addNewPollOption}>
                {formatMessage({
                  id: "alm.community.addNewPollOption",
                  defaultMessage: "Add Option",
                })}
              </button>
            )}
          </div>
        )}
        {!textMode && fileUploadProgress !== 100 && (
          <div>
            <ProgressBar
              label={formatMessage({
                id: "alm.uploading.label",
                defaultMessage: "Uploading...",
              })}
              value={fileUploadProgress}
            />
          </div>
        )}
        {!textMode && fileUploadProgress === 100 && (
          <div className={styles.primeStatus}>
            <div className={styles.primeStatusText}>Uploaded: {state.fileUpload.fileName}</div>
            <button
              className={styles.primeStatusSvg}
              title={formatMessage({
                id: "alm.removeUpload.label",
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
        <div className={styles.primePostButtonGroup}>
          <button
            onClick={close => {
              closeDialogHandler(close);
            }}
            className={`almButton secondary ${styles.button}`}
          >
            {formatMessage({
              id: "alm.community.cancel.label",
              defaultMessage: "Cancel",
            })}
          </button>
          {saveEnabled ? (
            <button
              onClick={close => {
                savePostHandler(close);
              }}
              className={`almButton primary`}
            >
              {formatMessage({
                id: "alm.community.post.label",
                defaultMessage: "Post",
              })}
            </button>
          ) : (
            <button disabled={true} className={`almButton primary`}>
              {formatMessage({
                id: "alm.community.post.label",
                defaultMessage: "Post",
              })}
            </button>
          )}
        </div>
      </ButtonGroup>
    </Dialog>
  );
};

export default PrimeCommunityAddPostDialog;
