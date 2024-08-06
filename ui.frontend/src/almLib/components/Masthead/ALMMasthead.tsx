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
import { getPreferredLocalizedMetadata, GetTranslation } from "../../utils/translationService";
import { useMasthead } from "../../hooks/widgets/masthead/useMasthead";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { IsAnyUrl, LoadScript } from "../../utils/widgets/utils";
import {
  GetBrightCoveAccountId,
  GetBrightCovePlayerId,
  GetPrimeWindow,
} from "../../utils/widgets/windowWrapper";
import { swipeEvents } from "../../utils/swipeDetector";

type MastHeadData = {
  actionUrl?: string;
  contentUrl?: string;
  sourceUrl?: string;
  contentType?: string;
  contentSources?: string[];
};
type Dimensions = {
  width?: string;
  height?: string;
};

const IMAGE = "IMAGE";
const VIDEO = "VIDEO";
const MIN_HEIGHT = 187;
const MAX_HEIGHT = 360;
const speed = 5000;
const LEFT = "left";
const RIGHT = "right";
const ALMMasthead = (props: any) => {
  const { formatMessage, locale } = useIntl();
  const { getAnnouncements, mastheadImageMap } = useMasthead();
  let mastHeads = props.mastHeads;
  const widget = props.widget;
  type DIRECTION = typeof LEFT | typeof RIGHT;
  // const MIN_WIDTH = 300;

  const slidesRef = useRef<HTMLDivElement>(null);
  let [mastHeadDimensions, setMastHeadDimensions] = useState<Dimensions>({});
  let [mastHeadsArray, setMastHeadsArray] = useState<MastHeadData[]>([]);
  let [mastHeadInitialized, setMastHeadInitialized] = useState(false);
  const [videoMap, setVideoMap] = useState<any>(new Map());

  const [rightArrowDisabled, setRightArrowDisabled] = useState(false);
  const [leftArrowDisabled, setLeftArrowDisabled] = useState(false);
  const [hideDots, setHideDots] = useState(false);
  const [announcementsRes, setAnnouncementsRes] = useState<any>();

  const translateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timer | undefined>();

  const defaultMastHead: MastHeadData = {
    contentUrl: mastheadImageMap[locale as keyof typeof mastheadImageMap] || "",
    contentType: IMAGE,
    contentSources: [],
  };

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
      case "moderate":
        height = "240px";
        break;
    }
    dimensions.width = "1280px";
    dimensions.height = height;
    return dimensions;
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    widget.attributes!.heading = GetTranslation("text.skipToMastHead");
    getMastHeads(announcementsRes);
  }, [mastHeadInitialized]);

  useEffect(() => {
    if (isFirstRender) {
      isFirstRender.current = false;
      animateMastHead();
    }
  }, [mastHeadsArray]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const res = await getAnnouncements();
      setAnnouncementsRes(res);
      getMastHeads(res);
    };

    fetchAnnouncements();

    return () => {
      clear();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--prime-mh-height",
      mastHeadDimensions.height || "240px"
    );
  }, [mastHeadDimensions]);

  const getMastHeadArray = async (announcementsRes: any) => {
    if (!announcementsRes) {
      return [];
    }
    const parsedResponse = JsonApiParse(announcementsRes);
    const announcements = parsedResponse.adminAnnouncementList || [];
    const mastHeads = [];
    for (let i = 0; i < announcements.length; i++) {
      let actionUrl = announcements[i].actionUrl;
      if (actionUrl && !IsAnyUrl(actionUrl)) {
        actionUrl = `http://${actionUrl}`;
      }

      const contentMetaData = getPreferredLocalizedMetadata(
        announcements[i].contentMetaData,
        locale
      );
      const mastHead: MastHeadData = {
        actionUrl: actionUrl,
        contentUrl: contentMetaData.contentUrl,
        contentType: contentMetaData.contentType,
        contentSources: contentMetaData.contentSources,
      };
      mastHeads.push(mastHead);
    }
    const newVideoMap = new Map(); // Make a copy of the current state map
    const newImageMap = new Map();
    mastHeads.forEach((mastHead, index) => {
      const contentType = mastHead.contentType;
      const value = `${contentType}-${index}`;
      contentType === VIDEO ? newVideoMap.set(index, value) : newImageMap.set(index, value);
    });
    if (mastHeads.length === 0) {
      mastHeads.push(defaultMastHead);
    }
    setVideoMap(newVideoMap);
    if (newVideoMap.size > 0) {
      const brightCoveAccountId = GetBrightCoveAccountId();
      const brightCovePlayerId = GetBrightCovePlayerId();
      await LoadScript(
        document.head || document.body,
        `//players.brightcove.net/${brightCoveAccountId}/${brightCovePlayerId}_default/index.min.js`,
        true
      );
    }
    return mastHeads;
  };

  const getMastHeads = async (announcements: any) => {
    setMastHeadDimensions(getMastHeadDimensions(widget.attributes?.size));
    const mastHeadDataArray: MastHeadData[] = [];
    mastHeads?.forEach((mastHead: PrimeMastHeadData) => {
      let mastHeadForCurrentLocale: MastHeadData = {} as MastHeadData;
      let mastHeadContent: PrimeMastHeadContentData = getPreferredLocalizedMetadata(
        mastHead.contentMetaData,
        locale
      ) as PrimeMastHeadContentData;
      mastHeadForCurrentLocale.actionUrl = mastHead.actionUrl;
      mastHeadForCurrentLocale.contentUrl = mastHeadContent?.contentUrl;
      mastHeadForCurrentLocale.sourceUrl = mastHeadContent?.sourceUrl;
      mastHeadForCurrentLocale.contentType = IMAGE;
      mastHeadDataArray.push(mastHeadForCurrentLocale);
    });
    const mastHeadsRes = await getMastHeadArray(announcements);
    const mastHeadsData = mastHeadDataArray.length ? mastHeadDataArray : mastHeadsRes;
    if (mastHeadsData.length) {
      setMastHeadsArray(mastHeadsData);
      setMastHeadInitialized(true);
    }
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

  const addOrRemoveFocusOnDot = (identifier: string, removeFocus?: boolean, highLight = false) => {
    const element = getElement(identifier);

    const classSelected = styles.primeMastheadSelectedDot;
    const buttonElement = element?.getElementsByTagName("b")[0];

    if (removeFocus) {
      buttonElement?.setAttribute("tabindex", "-1");
      element?.setAttribute("aria-selected", "false");
      //buttonElement.style.outline = "0";
      buttonElement?.classList.remove(classSelected);
    } else {
      buttonElement?.classList.add(classSelected);
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

  const updateUI = (currIndex: number, nextIndex: number, highLight: boolean) => {
    const numElements = getNumElements();
    const continueButton = getContinueButton();
    setLeftArrowDisabled(nextIndex === 0);
    setRightArrowDisabled(nextIndex === numElements - 1);
    mastHeadsArray[nextIndex]?.actionUrl
      ? showElement(continueButton as HTMLElement)
      : hideElement(continueButton as HTMLElement);
    const currDotId = `#index-${currIndex}`;
    addOrRemoveFocusOnDot(currDotId, true, highLight);
    const nextDotId = `#index-${nextIndex}`;
    addOrRemoveFocusOnDot(nextDotId, false, highLight);
    if (videoMap.has(currIndex)) {
      pausePlayer(videoMap.get(currIndex));
    }
    if (videoMap.has(nextIndex)) {
      videoPlayer(videoMap.get(nextIndex), resetInterval);
    }
  };

  const getNumElements = () => {
    return (mastHeads || mastHeadsArray).length;
  };

  const continueButtonClickHandler = () => {
    const currIndex = -translateRef.current / 100;
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
    const currIndex = -translateRef.current / 100;
    if (index === currIndex) {
      return;
    } else if (direction === RIGHT) {
      translateRef.current =
        translateRef.current === 0 ? (numElements - 1) * -100 : translateRef.current + 100;
    } else {
      translateRef.current =
        index !== undefined
          ? -index * 100
          : translateRef.current === (numElements - 1) * -100
            ? 0
            : translateRef.current - 100;
    }
    const nextIndex = -translateRef.current / 100;
    updateUI(currIndex, nextIndex, highLight);
    if (mastHead) {
      mastHead.style.transform = `translate(${translateRef.current}%)`;
    }
    if (highLight) {
      showTablist();
    }
  };

  const videoPlayer = (id: string, resetInterval: any, shouldResetInterval = false) => {
    const player = GetPrimeWindow().videojs(id);
    if (player.error()) {
      console.log(player.error());
      player.error(null);
      //player.errorDisplay!.el_!.classList!.add("vjs-hidden");
      player.errors.timeout(300 * 1000);
    }

    player.controls(false);
    player.muted(true);

    player.ready(() => {
      if (shouldResetInterval && typeof resetInterval === "function") {
        resetInterval();
      }
      player.currentTime(0);
      const playPromise = player.play();
      playPromise.catch((error: Error) => {
        console.error("Error while playing video:", error);
      });

      player.on("timeupdate", function () {
        if (player.currentTime() >= speed / 1000) {
          player.currentTime(0);
          try {
            player.play();
          } catch (e) {
            console.log(e);
          }
        }
      });
    });
  };

  const pausePlayer = (id: string) => {
    const player = GetPrimeWindow().videojs(id);
    player.pause();
  };

  const swipe = (direction: string) => {
    clear();
    rotate(undefined, direction, true);
    resetInterval();
  };

  const clear = () => {
    clearInterval(intervalRef.current);
  };

  const resetInterval = () => {
    clear();
    intervalRef.current = setInterval(rotate, speed);
  };

  const displaySelectedDot = (eventTarget: HTMLElement) => {
    if (eventTarget) {
      const index = parseInt(eventTarget.innerText);
      if (!isNaN(index)) {
        clear();
        rotate(index, undefined, true);
        resetInterval();
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
    setLeftArrowDisabled(true);

    if (!mastHeadsArray[0].actionUrl) {
      hideElement(continueButton as HTMLElement);
    }

    if (mastHeadsArray.length === 1) {
      setRightArrowDisabled(true);
      setHideDots(true);
      //no need to add event listeners if there is only one element
      return;
    }

    addOrRemoveFocusOnDot("#index-0");

    if (!intervalRef.current) {
      intervalRef.current = setInterval(rotate, speed);
    }

    if (videoMap.has(0)) {
      videoPlayer(videoMap.get(0), resetInterval, true);
    }
    const slides = slidesRef.current;
    const focusEventsList = ["mouseenter", "focusin", "activate"];
    const focusoutEventList = ["focusout", "mouseleave", "onblur"];
    focusEventsList.forEach(event => {
      slides?.addEventListener(event, clear, true);
    });
    focusoutEventList.forEach(event => {
      slides?.addEventListener(event, resetInterval, true);
    });

    slides?.addEventListener("keyup", (e: any) => {
      const activeElement = getActiveElement();
      if ((activeElement && activeElement === primeDots) || primeDots?.contains(activeElement)) {
        let direction = "";
        const key = e.which || e.keyCode || 0;
        if (key === 39) {
          direction = LEFT;
        } else if (key === 37) {
          direction = RIGHT;
        }
        showTablist();
        if (direction) {
          clear();
          rotate(undefined, direction, true);
          //interval = setInterval(<any>rotate, speed);
        }
      } else {
        hideTablist();
      }
    });

    const excludedElements = [continueButton, primeDots] as HTMLElement[];
    if (slides) {
      swipeEvents(slides, excludedElements, swipe);
    }

    // swipeEvents(
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

  const isValidHttpsUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "https:";
    } catch (ex) {
      console.log("Exception while validating URL:", ex);
      return false;
    }
  };

  const getMastHeadVideo = (mastHead: any, id: any) => {
    return (
      <li aria-roledescription="slide" key={id}>
        <div className={styles.primeMastheadMedia} aria-hidden="true">
          <video
            id={id}
            data-automationid={id}
            data-account={GetBrightCoveAccountId()}
            data-player={GetBrightCovePlayerId()}
            data-embed="default"
            data-application-id
            className="video-js"
            preload="auto"
            muted={true}
            playsInline={true}
            autoPlay={true}
            aria-hidden="true"
            controls={false}
            ref={(videoElement: any) => {
              if (videoElement) {
                videoElement.muted = true;
                videoElement.defaultMuted = true;
              }
            }}
          >
            {mastHead.contentSources?.map((contentSource: any, index: number) => {
              const urlStr = contentSource["src"];
              if (urlStr && isValidHttpsUrl(urlStr)) {
                return <source key={index} src={urlStr} type={contentSource["type"]} />;
              }
              return null; // Return null for the case where no <source> element is rendered
            })}
          </video>
        </div>
      </li>
    );
  };

  const getMastHeadImage = (imageName: string, contentUrl: string, id: string) => {
    return (
      <li aria-roledescription="slide" key={id}>
        <div className={styles.primeMastheadMedia} aria-hidden="true">
          <img
            alt={imageName}
            style={{
              objectFit: "cover",
              maxWidth: mastHeadDimensions.width,
              ...(mastHeads ? { height: mastHeadDimensions.height } : {}),
            }}
            src={contentUrl}
            loading="eager"
            id={id}
            data-automationid={`mastheadImg-${imageName}`}
          />
        </div>
      </li>
    );
  };

  const renderArrowButton = (direction: DIRECTION): JSX.Element => {
    const id = direction === LEFT ? "rotateLeft" : "rotateRight";
    const disabled = direction === LEFT ? leftArrowDisabled : rightArrowDisabled;
    const tabIndex = disabled ? -1 : 0;
    const onClick = () => swipe(direction === LEFT ? RIGHT : LEFT);
    const ariaLabelId = direction === LEFT ? "alm.text.previousSlide" : "alm.text.nextSlide";
    const icon = direction === LEFT ? <ChevronLeft /> : <ChevronRight />;

    return (
      <button
        id={id}
        disabled={disabled}
        tabIndex={tabIndex}
        className={disabled ? styles.primeMastheadNavIconDisabled : styles.primeMastheadIcon}
        aria-label={formatMessage({
          id: ariaLabelId,
        })}
        onClick={onClick}
      >
        {icon}
      </button>
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
            data-skip-link-target={widget.layoutAttributes?.id}
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
              ref={slidesRef}
              className={styles.primeSlides}
              style={{
                maxWidth: mastHeadDimensions.width,
                height: mastHeadDimensions.height,
              }}
              aria-live="off"
            >
              <ul id="mastHead" className={styles.primeMasthead}>
                {mastHeadsArray.map((mastHead, index) => {
                  const id = `${mastHead.contentType}-${index}`;
                  const contentUrl = mastHead.contentUrl || "";
                  let imageName = "";

                  if (mastHead.contentType === IMAGE) {
                    const contentUrlSplitted = contentUrl?.split("/") || [];
                    if (contentUrlSplitted.length > 0) {
                      imageName = contentUrlSplitted[contentUrlSplitted.length - 1].split("?")[0];
                    }
                    return getMastHeadImage(imageName, contentUrl, id);
                  }
                  return getMastHeadVideo(mastHead, id);
                })}
              </ul>
              <div className={styles.primeMastheadDots}>
                <div className={styles.primeMastheadActions}>
                  <ul
                    id="prime-dots"
                    role="tablist"
                    onClick={(event: any) => primeDotsClickHandler(event)}
                    onBlur={hideTablist}
                    className={styles.primeDots}
                  >
                    {hideDots
                      ? ""
                      : mastHeadsArray.map((_mastHead, index) => {
                          const dotId = `index-${index}`;
                          return getDot(dotId, index);
                        })}
                  </ul>
                  <div className={styles.primeLearnMore}>
                    <button
                      className={styles.primeMastheadContinue}
                      id="continue"
                      onClick={continueButtonClickHandler}
                      style={{ visibility: "hidden" }}
                    >
                      {formatMessage({
                        id: "alm.text.learnMore",
                      })}
                    </button>
                  </div>
                  <div className={styles.primeMastheadNavIcons}>
                    <div className={styles.primeMastheadIconsContainer}>
                      {renderArrowButton(LEFT)}
                      {renderArrowButton(RIGHT)}
                    </div>
                  </div>
                </div>
                {/* to check - */}
                {/* <div
                  id="tablist-highlight"
                  className="primeMasthead-carousel-tablist-highlight"
                ></div> */}
              </div>
            </div>
          </div>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ALMMasthead;
