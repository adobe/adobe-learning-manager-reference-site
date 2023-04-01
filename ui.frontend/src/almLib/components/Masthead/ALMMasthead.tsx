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
import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { ALMErrorBoundary } from "../Common/ALMErrorBoundary";
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";
import ChevronRight from "@spectrum-icons/workflow/ChevronRight";
import styles from "./ALMMasthead.module.css";
import { PrimeMastHeadContentData, PrimeMastHeadData } from "../../models";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";

type MastHeadData = {
  actionUrl?: string;
  contentUrl?: string;
  sourceUrl?: string;
  contentType?: string;
};
type Dimensions = {
  width?: string;
  height?: string;
};

const ALMMasthead = (props: any) => {
  const { formatMessage, locale } = useIntl();
  let mastHeads = props.mastHeads;
  // const MIN_WIDTH = 300;
  const MIN_HEIGHT = 187;
  const MAX_HEIGHT = 360;
  let translate = 0;
  const speed = 5000;
  let [mastHeadDimensions, setMastHeadDimensions] = useState<Dimensions>({});
  let [mastHeadsArray, setMastHeadsArray] = useState<MastHeadData[]>([]);
  let [mastHeadInitialized, setMastHeadInitialized] = useState(false);
  let rightArrowDisabled = false;
  let leftArrowDisabled = false;
  let hideDots = false;

  const getMastHeadDimensions = (size: string | undefined) => {
    const dimensions: Dimensions = {};
    let height = MAX_HEIGHT + "px";
    switch (size) {
      case "small":
        height = MIN_HEIGHT + "px";
        break;
      case "medium":
        height = "273px";
        break;
    }
    dimensions.width = "1280px";
    dimensions.height = height;
    return dimensions;
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!mastHeadInitialized && mastHeads) {
      getMastHeads();
    }
  }, [mastHeads, mastHeadInitialized]);

  useEffect(() => {
    if (isFirstRender && mastHeadsArray.length > 1) {
      isFirstRender.current = false;
      animateMastHead();
    }
  }, [mastHeadsArray]);

  const getMastHeads = async () => {
    setMastHeadDimensions(getMastHeadDimensions("medium"));
    // const resourceTemplate = "banner_${locale}.png";
    const mastHeadDataArray: MastHeadData[] = [];
    mastHeads?.forEach((mastHead: PrimeMastHeadData) => {
      let mastHeadForCurrentLocale: MastHeadData = {} as MastHeadData;
      let mastHeadContent: PrimeMastHeadContentData =
        getPreferredLocalizedMetadata(
          mastHead.contentMetaData,
          locale
        ) as PrimeMastHeadContentData;
      mastHeadForCurrentLocale.actionUrl = mastHead.actionUrl;
      mastHeadForCurrentLocale.contentUrl = mastHeadContent?.contentUrl;
      mastHeadForCurrentLocale.sourceUrl = mastHeadContent?.sourceUrl;
      mastHeadForCurrentLocale.contentType = "IMAGE";
      mastHeadDataArray.push(mastHeadForCurrentLocale);
    });
    setMastHeadsArray(mastHeadDataArray);
    setMastHeadInitialized(true);
  };

  const getElement = (ele: string) => {
    return document.querySelector<HTMLElement>(ele);
  };

  const getActiveElement = () => {
    return document.activeElement;
  };

  const getTabListHighLight = () => {
    return getElement("#tablist-highlight");
  };

  const showTablist = () => {
    const tabListHighLight = getTabListHighLight();
    if (tabListHighLight) {
      tabListHighLight.style.display = "block";
    }
  };

  const hideTablist = () => {
    const tabListHighLight = getTabListHighLight();
    if (tabListHighLight) {
      tabListHighLight.style.display = "none";
    }
  };

  const getContinueButton = () => {
    return getElement("#continue");
  };

  const addOrRemoveFocusOnDot = (
    identifier: string,
    removeFocus?: boolean,
    highLight = false
  ) => {
    const element = getElement(identifier);
    const color = removeFocus ? "hsla(0,0%,100%,.3)" : "#fff";
    const buttonElement = element?.getElementsByTagName("b")[0];
    if (buttonElement) {
      buttonElement.style.backgroundColor = color;
    }
    if (removeFocus) {
      buttonElement?.setAttribute("tabindex", "-1");
      element?.setAttribute("aria-selected", "false");
      //buttonElement.style.outline = "0";
    } else {
      buttonElement?.setAttribute("tabindex", "0");
      element?.setAttribute("aria-selected", "true");
      if (highLight && buttonElement) {
        buttonElement?.focus();
      }
    }
  };

  const showElement = (element: HTMLElement) => {
    if (element) {
      element.style.visibility = "visible";
    }
  };

  const hideElement = (element: HTMLElement) => {
    if (element) {
      element.style.visibility = "hidden";
    }
  };

  const updateUI = (
    currIndex: number,
    nextIndex: number,
    highLight: boolean
  ) => {
    const numElements = getNumElements();
    const continueButton = getContinueButton();
    leftArrowDisabled = nextIndex === 0 ? true : false;
    rightArrowDisabled = nextIndex === numElements - 1 ? true : false;
    mastHeadsArray[nextIndex]?.actionUrl
      ? showElement(continueButton as HTMLElement)
      : hideElement(continueButton as HTMLElement);
    const currDotId = `#index-${currIndex}`;
    addOrRemoveFocusOnDot(currDotId, true, highLight);
    const nextDotId = `#index-${nextIndex}`;
    addOrRemoveFocusOnDot(nextDotId, false, highLight);
  };

  const getNumElements = () => {
    return mastHeads?.length;
  };

  const continueButtonClickHandler = () => {
    const currIndex = -translate / 100;
    const curMastHead = mastHeadsArray[currIndex];
    const actionUrl = curMastHead.actionUrl;
    if (actionUrl) {
      const win = window.open(actionUrl, "_blank");
      win?.focus();
    }
  };

  const rotate = (index?: number, direction?: string, highLight = false) => {
    const numElements = getNumElements();
    const mastHead = getElement("#mastHead");
    const currIndex = -translate / 100;
    if (index === currIndex) {
      return;
    } else if (direction === "right") {
      translate = translate === 0 ? (numElements - 1) * -100 : translate + 100;
    } else {
      translate =
        index !== undefined
          ? -index * 100
          : translate === (numElements - 1) * -100
          ? 0
          : translate - 100;
    }
    const nextIndex = -translate / 100;
    updateUI(currIndex, nextIndex, highLight);
    if (mastHead) {
      mastHead.style.transform = `translate(${translate}%)`;
    }
    if (highLight) {
      showTablist();
    }
  };

  const swipe = (direction: string) => {
    clear();
    rotate(undefined, direction, true);
    interval = setInterval(rotate, speed);
  };

  let interval = setInterval(rotate, speed);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [interval]);

  const clear = () => {
    clearInterval(interval);
  };

  const resetInterval = () => {
    clear();
    interval = setInterval(rotate, speed);
  };

  const displaySelectedDot = (eventTarget: HTMLElement) => {
    if (eventTarget) {
      const index = parseInt(eventTarget.innerText);
      if (!isNaN(index)) {
        clear();
        rotate(index, undefined, true);
        clear();
        interval = setInterval(rotate, speed);
      }
    }
  };

  const primeDotsClickHandler = (e: Event) => {
    const eventTarget = e.target as HTMLElement;
    displaySelectedDot(eventTarget);
  };

  const animateMastHead = () => {
    const firstDot = getElement("#index-0");
    if (!firstDot || !mastHeadInitialized) {
      return;
    }
    const continueButton = getContinueButton();
    const primeDots = getElement("#prime-dots");
    const tabListHighLight = getElement("#tablist-highlight"); //self.root$("#tablist-highlight");

    const setTablistHighlightBox = () => {
      const dots = primeDots?.children || [];
      let dot, offsetTop, offsetLeft, height, width;
      const highlightBox: { [key: string]: number } = {};

      highlightBox.top = 0;
      highlightBox.left = 1000000;
      highlightBox.height = 0;
      highlightBox.width = 0;
      for (let i = 0; i < dots.length; i++) {
        dot = dots[i] as HTMLElement;
        height = dot.offsetHeight;
        width = dot.offsetWidth;
        offsetLeft = dot.offsetLeft;
        offsetTop = dot.offsetTop;
        if (highlightBox.top < offsetTop) {
          highlightBox.top = Math.round(offsetTop);
        }
        if (highlightBox.height < height) {
          highlightBox.height = Math.round(height);
        }
        if (highlightBox.left > offsetLeft) {
          highlightBox.left = Math.round(offsetLeft);
        }
        const w = offsetLeft - highlightBox.left + Math.round(width);
        if (highlightBox.width < w) {
          highlightBox.width = w;
        }
      }

      if (tabListHighLight) {
        tabListHighLight.style.top = highlightBox.top - 4 + "px";
        tabListHighLight.style.left = highlightBox.left - 8 + "px";
        tabListHighLight.style.height = highlightBox.height + 7 + "px";
        tabListHighLight.style.width = highlightBox.width + 8 + "px";
      }
    }; // end function

    setTablistHighlightBox();
    leftArrowDisabled = true;

    if (!mastHeadsArray[0].actionUrl) {
      hideElement(continueButton as HTMLElement);
    }

    if (mastHeadsArray.length === 1) {
      rightArrowDisabled = true;
      hideDots = true;
      //no need to add event listeners if there is only one element
      return;
    }

    addOrRemoveFocusOnDot("#index-0");

    // const focusEventsList = ["mouseenter", "focusin", "activate"];
    // const focusoutEventList = ["focusout", "mouseleave", "onblur"];
    // focusEventsList.forEach((event) => {
    //   slides?.addEventListener(event, clear, true);
    // });
    // focusoutEventList.forEach((event) => {
    //   slides?.addEventListener(event, resetInterval, true);
    // });

    // slides?.addEventListener("keyup", (e) => {
    //   const activeElement = getActiveElement();
    //   if (
    //     (activeElement && activeElement == primeDots) ||
    //     primeDots?.contains(activeElement)
    //   ) {
    //     let direction = "";
    //     const key = e.which || e.keyCode || 0;
    //     if (key === 39) {
    //       direction = "left";
    //     } else if (key === 37) {
    //       direction = "right";
    //     }
    //     showTablist();
    //     if (direction) {
    //       clear();
    //       rotate(undefined, direction, true);
    //       //interval = setInterval(<any>rotate, speed);
    //     }
    //   } else {
    //     hideTablist();
    //   }
    // });

    // const excludedElements = [continueButton, primeDots];

    // swipeEven(
    //   slides as HTMLElement,
    //   excludedElements as HTMLElement[],
    //   swipe
    // );
  };

  const getDot = (dotId: string, index: number) => {
    return (
      <li id={dotId} role="tab" aria-selected="false" key={dotId}>
        <b
          tabIndex={-1}
          aria-label={formatMessage(
            {
              id: "alm.text.mastHeadDot",
            },
            {
              "0": (index + 1).toString(),
            }
          )}
        >
          {index}
        </b>
      </li>
    );
  };

  const getMastHeadImage = (
    imageName: string,
    contentUrl: string,
    id: string
  ) => {
    return (
      <li aria-roledescription="slide" key={id}>
        <div className={styles.primeMastheadMedia} aria-hidden="true">
          <img
            alt={imageName}
            style={{
              objectFit: "cover",
              maxWidth: mastHeadDimensions.width,
              height: mastHeadDimensions.height,
            }}
            src={contentUrl}
            loading="eager"
            id={id}
          />{" "}
        </div>
      </li>
    );
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <div
            id="carousel"
            className={styles.primeCarousel}
            tabIndex={0}
            role="complementary"
            aria-labelledby="masthead_title"
            aria-describedby="masthead_desc"
          >
            <h2 id="masthead_title" className={styles.primeMastheadSrOnly}>
              {mastHeadsArray.length > 1
                ? formatMessage(
                    {
                      id: "alm.text.mastHeadHeading",
                    },
                    {
                      "0": mastHeadsArray.length.toString(),
                    }
                  )
                : formatMessage({
                    id: "alm.text.mastHeadHeadingWithOneSlide",
                  })}
            </h2>
            <p id="masthead_desc" className={styles.primeMastheadSrOnly}>
              {mastHeadsArray.length > 1
                ? formatMessage({
                    id: "alm.text.masthead.sr.description",
                  })
                : ""}
            </p>
            <div
              id="slides"
              className={styles.primeSlides}
              style={{
                maxWidth: mastHeadDimensions.width,
              }}
              aria-live="off"
            >
              <ul id="mastHead" className={styles.primeMasthead}>
                {mastHeadsArray.map((mastHead, index) => {
                  const id = `${mastHead.contentType}-${index}`;
                  const contentUrl = mastHead.contentUrl || "";
                  let imageName = "";

                  if (mastHead.contentType === "IMAGE") {
                    const contentUrlSplitted = contentUrl?.split("/") || [];
                    if (contentUrlSplitted.length > 0) {
                      imageName =
                        contentUrlSplitted[contentUrlSplitted.length - 1].split(
                          "?"
                        )[0];
                    }
                  }
                  return getMastHeadImage(imageName, contentUrl, id);
                })}
              </ul>
              <div className={styles.primeMastheadDots}>
                <div className={styles.primeMastheadActions}>
                  <button
                    className={styles.primeMastheadContinue}
                    id="continue"
                    onClick={continueButtonClickHandler}
                  >
                    {formatMessage({
                      id: "alm.text.learnMore",
                    })}
                  </button>
                </div>
                {/* <div
                  id="tablist-highlight"
                  className="primeMasthead-carousel-tablist-highlight"
                ></div> */}
                <ul
                  id="prime-dots"
                  role="tablist"
                  onClick={(event: any) => primeDotsClickHandler(event)}
                  onBlur={hideTablist}
                  className={styles.primeDots}
                >
                  {mastHeadsArray.map((_mastHead, index) => {
                    const dotId = `index-${index}`;
                    return hideDots ? "" : getDot(dotId, index);
                  })}
                </ul>
              </div>
              <div className={styles.primeMastheadNavIcons}>
                <div className={styles.primeMastheadIconsContainer}>
                  <button
                    id="rotateLeft"
                    disabled={leftArrowDisabled}
                    tabIndex={leftArrowDisabled ? -1 : 0}
                    className={
                      leftArrowDisabled
                        ? styles.primeMastheadNavIconDisabled
                        : styles.primeMastheadIcon
                    }
                    aria-label={formatMessage({
                      id: "alm.text.previousSlide",
                    })}
                    onClick={() => swipe("right")}
                  >
                    {<ChevronLeft />}
                  </button>
                  <button
                    id="rotateRight"
                    disabled={rightArrowDisabled}
                    tabIndex={rightArrowDisabled ? -1 : 0}
                    className={
                      rightArrowDisabled
                        ? styles.primeMastheadNavIconDisabled
                        : styles.primeMastheadIcon
                    }
                    aria-label={formatMessage({
                      id: "alm.text.nextSlide",
                    })}
                    onClick={() => swipe("left")}
                  >
                    {<ChevronRight />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ALMMasthead;
