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
import Cancel from "@spectrum-icons/workflow/Cancel";
import Send from "@spectrum-icons/workflow/Send";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ReactQuill from "react-quill";
import { PrimeCommunityLinkPreview } from "../PrimeCommunityLinkPreview";
import styles from "./PrimeCommunityObjectInput.module.css";
import "react-quill/dist/quill.snow.css";
// import { PrimeCommunityLoLinkPreview } from "../PrimeCommunityLoLinkPreview";

const PrimeCommunityObjectInput = React.forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const objectTextLimit = props.characterLimit ? props.characterLimit : 1000;
  const emptyString = "";
  const [charactersRemaining, setCharactersRemaining] = useState(objectTextLimit);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  // const [ showLoLinkPreview, setShowLoLinkPreview ] = useState(false);
  const firstRun = useRef(true);
  const [userInputText, setUserInputText] = useState(props.defaultValue ? props.defaultValue : "");
  const [characterCount, setCharacterCount] = useState(0);

  const exitActions = () => {
    setUserInputText(emptyString);
    setCharactersRemaining(objectTextLimit);
    setShowLinkPreview(false);
    // setShowLoLinkPreview(false);
  };

  const primaryActionHandler = () => {
    if (characterCount <= 0) {
      return;
    }
    if (typeof props.primaryActionHandler === "function") {
      props.primaryActionHandler(userInputText);
      exitActions();
    }
  };

  const secondaryActionHandler = () => {
    if (typeof props.secondaryActionHandler === "function") {
      props.secondaryActionHandler(userInputText);
      exitActions();
    }
  };

  const processInput = async () => {
    checkTextCount();
    if (!showLinkPreview) {
      setShowLinkPreview(true);
    } else if (userInputText === emptyString) {
      setShowLinkPreview(false);
    }
    // if(showLoLinkPreview) {
    //     setShowLoLinkPreview(true);
    // } else if(ref.current.value === emptyString) {
    //     setShowLoLinkPreview(false);
    // }
  };

  const checkTextCount = () => {
    if (ref.current && typeof ref.current.value !== "undefined") {
      const currentInputLength = stripHtmlTags(ref.current.value).length;
      if (currentInputLength > 0) {
        if (typeof props.enablePrimaryAction === "function") {
          ref.current.value.trim() !== ""
            ? props.enablePrimaryAction()
            : props.disablePrimaryAction();
        }
      } else {
        if (typeof props.disablePrimaryAction === "function") {
          props.disablePrimaryAction();
        }
      }
    }
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (props.defaultValue !== "") {
        processInput();
      }
    }
  }, [props.defaultValue]);

  const tooltipPlaceholder = "Please enter a link";
  useEffect(() => {
    const handleTooltipClick = function () {
      const tooltipInputElement = document.querySelector(
        '.ql-tooltip input[placeholder="https://quilljs.com"]'
      );
      if (tooltipInputElement) {
        tooltipInputElement.setAttribute("placeholder", tooltipPlaceholder);
      }
    };

    document.addEventListener("click", handleTooltipClick);
    return () => {
      document.removeEventListener("click", handleTooltipClick);
    };
  }, []);

  const handleEditorTextChange = (value: string) => {
    const charCount = stripHtmlTags(value).length;
    if (charCount <= objectTextLimit) {
      setUserInputText(value);
      setCharacterCount(charCount);
      const charRemainingCount = objectTextLimit < charCount ? 0 : objectTextLimit - charCount;
      setCharactersRemaining(charRemainingCount);
    } else {
      const quillEditor = ref.current.getEditor();
      quillEditor.history.undo();
      setUserInputText(userInputText);
      setCharacterCount(characterCount);
      setCharactersRemaining(charactersRemaining);
    }
    processInput();
  };

  const stripHtmlTags = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const toolbarOptions = props.concisedToolbarOptions
    ? [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ color: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ]
    : [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ];

  return (
    <>
      <div className={styles.primePostObjectWrapper}>
        <ReactQuill
          value={userInputText}
          onChange={handleEditorTextChange}
          className={styles.primePostObjectInput}
          placeholder={props.inputPlaceholder}
          modules={{
            toolbar: toolbarOptions,
          }}
          ref={ref}
        />
        <style>{`
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 10px;
        }
       
        .ql-editor a {
          text-decoration: none !important;
          cursor: pointer;
          width: fit-content;
          
        }
        .ql-tooltip {
          display:flex;
          z-index:2000;
          position:${props.concisedToolbarOptions ? "absolute" : "fixed"} !important;
        }
        .ql-container.ql-snow {
          max-height: fit-content !important;
         }
      `}</style>
        <div className={styles.primeTextAreaCountRemaining}>
          {charactersRemaining}{" "}
          {formatMessage({
            id: "alm.community.post.charactersLeft",
            defaultMessage: "characters left",
          })}
        </div>
        {props.primaryActionHandler && (
          <button className={styles.primeSaveObjectButton} onClick={primaryActionHandler}>
            <Send UNSAFE_className={styles.postActionSvg} />
          </button>
        )}
        {props.secondaryActionHandler && (
          <button className={styles.primeSaveObjectButton} onClick={secondaryActionHandler}>
            <Cancel UNSAFE_className={styles.postActionSvg} />
          </button>
        )}
      </div>
      <div className={styles.primePreviewImage}>
        <PrimeCommunityLinkPreview
          currentInput={userInputText}
          showLinkPreview={showLinkPreview}
        ></PrimeCommunityLinkPreview>
      </div>
      {/* <PrimeCommunityLoLinkPreview currentInput={ref?.current?.value} showLoLinkPreview={showLoLinkPreview}></PrimeCommunityLoLinkPreview> */}
    </>
  );
});
export default PrimeCommunityObjectInput;
