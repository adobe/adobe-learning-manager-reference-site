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
import styles from "./PrimeCommunityObjectInput.module.css";
import { useIntl } from "react-intl";
import Send from "@spectrum-icons/workflow/Send";
import Cancel from "@spectrum-icons/workflow/Cancel";
import React, { useEffect, useState, useRef } from "react";
import { PrimeCommunityLinkPreview } from "../PrimeCommunityLinkPreview";
// import { PrimeCommunityLoLinkPreview } from "../PrimeCommunityLoLinkPreview";

const PrimeCommunityObjectInput = React.forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const objectTextLimit = props.characterLimit ? props.characterLimit : 1000;
  const emptyString = "";
  const [charactersRemaining, setCharactersRemaining] =
    useState(objectTextLimit);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  // const [ showLoLinkPreview, setShowLoLinkPreview ] = useState(false);
  const firstRun = useRef(true);

  const exitActions = () => {
    ref.current.value = emptyString;
    setCharactersRemaining(objectTextLimit);
    setShowLinkPreview(false);
    // setShowLoLinkPreview(false);
  };

  const primaryActionHandler = () => {
    if (ref && ref.current.value.length <= 0) {
      return;
    }
    if (typeof props.primaryActionHandler === "function") {
      props.primaryActionHandler(ref.current.value);
      exitActions();
    }
  };

  const secondaryActionHandler = () => {
    if (typeof props.secondaryActionHandler === "function") {
      props.secondaryActionHandler(ref.current.value);
      exitActions();
    }
  };

  const processInput = async () => {
    checkTextCount();
    if (!showLinkPreview) {
      setShowLinkPreview(true);
    } else if (ref.current.value === emptyString) {
      setShowLinkPreview(false);
    }
    // if(showLoLinkPreview) {
    //     setShowLoLinkPreview(true);
    // } else if(ref.current.value === emptyString) {
    //     setShowLoLinkPreview(false);
    // }
  };

  const checkTextCount = () => {
    const currentInputLength =
      ref && ref.current ? ref.current.value.length : 0;
    setCharactersRemaining(
      objectTextLimit < currentInputLength
        ? 0
        : objectTextLimit - currentInputLength
    );
    if (currentInputLength > 0) {
      if (typeof props.enablePrimaryAction === "function") {
        ref.current.value.trim() !== "" ? props.enablePrimaryAction() :  props.disablePrimaryAction();
      }
    } else {
      if (typeof props.disablePrimaryAction === "function") {
        props.disablePrimaryAction();
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

  return (
    <>
      <div>
        <div className={styles.primePostObjectWrapper}>
          <textarea
            ref={ref}
            onKeyUp={processInput}
            className={styles.primePostObjectInput}
            defaultValue={props.defaultValue ? props.defaultValue : ""}
            placeholder={props.inputPlaceholder}
            maxLength={objectTextLimit}
          ></textarea>
          {props.primaryActionHandler && (
            <button
              className={styles.primeSaveObjectButton}
              onClick={primaryActionHandler}
            >
              <Send UNSAFE_className={styles.postActionSvg} />
            </button>
          )}
          {props.secondaryActionHandler && (
            <button
              className={styles.primeSaveObjectButton}
              onClick={secondaryActionHandler}
            >
              <Cancel UNSAFE_className={styles.postActionSvg} />
            </button>
          )}
          <div className={styles.primeTextAreaCountRemaining}>
            {charactersRemaining}{" "}
            {formatMessage({
              id: "alm.community.post.charactersLeft",
              defaultMessage: "characters left",
            })}
          </div>
        </div>
        <PrimeCommunityLinkPreview
          currentInput={ref?.current?.value}
          showLinkPreview={showLinkPreview}
        ></PrimeCommunityLinkPreview>
        {/* <PrimeCommunityLoLinkPreview currentInput={ref?.current?.value} showLoLinkPreview={showLoLinkPreview}></PrimeCommunityLoLinkPreview> */}
      </div>
    </>
  );
});
export default PrimeCommunityObjectInput;
