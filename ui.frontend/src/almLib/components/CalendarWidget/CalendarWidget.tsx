import styles from "./CalendarWidget.module.css";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../utils/translationService";
import { FILTER_ICON, EMPTY_STATE_CARD } from "../../utils/inline_svg";
import { useEffect, useRef, useState } from "react";
import { useCalendar } from "../../hooks/widgets/calendar/useCalendar";
import { getALMUser, getWidgetConfig } from "../../utils/global";
import { ONE_DAY, add, diffBetweenDates, isAfter } from "../../utils/widgets/dates";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { PrimeUserCalendar } from "../../models";

import {
  GetFormattedSessionTimeForCalendar,
  TransformToUpperCase,
} from "../../utils/widgets/utils";
import { useIntl } from "react-intl";
import {
  GetCertPageLink,
  GetCourseInstancePreviewPageLink,
  GetCoursePageLink,
  GetLPPageLink,
  GetShowCourseInstancePreviewPageLink,
  SendLinkEvent,
} from "../../utils/widgets/base/EventHandlingBase";
import { useCardIcon } from "../../utils/hooks";
import { GetTileImageFromId } from "../../utils/themes";
import {
  CARD_HEIGHT,
  CARD_WIDTH_EXCLUDING_PADDING,
  DOUBLE_CARD_WIDTH_EXCLUDING_PADDING,
  WIDGET_HEIGHT,
} from "../../utils/widgets/common";
import { ALMErrorBoundary } from "../Common/ALMErrorBoundary";
import { INSTANCE_CARD_BACKGROUND_SIZE } from "../../utils/constants";

//hook - look for prime config in url/ send message to parent for the config

const CalendarWidget = (props: any) => {
  const { widget, doRefresh } = props;
  const DAYS_IN_A_YEAR = 365;
  const cardHeight = CARD_HEIGHT;
  const CALENDAR_VIEWS = {
    CALENDAR: "CALENDAR",
    FILTER: "FILTER",
    SESSIONS: "SESSIONS",
  };

  const { locale, formatMessage } = useIntl();

  const { config, getCPrimeCalendarData, getCities } = useCalendar();
  const [noOfCards, setNoOfCards] = useState(widget.layoutAttributes?.cardsToShow);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [detailViewTemplate, setDetailViewTemplate] = useState<JSX.Element[]>([]);
  const [daysTemplate, setDaysTemplate] = useState<JSX.Element[]>([]);
  const [detailViewTitle, setDetailViewTitle] = useState({
    day: 1,
    month: "",
    year: 1999,
  });
  const enrolledSessionsRef = useRef<HTMLInputElement>(null);
  const [cpCalendarData, setCpCalendarData] = useState<null | {
    [id: number]: PrimeUserCalendar[][][];
  }>(null);
  const [allCalenderSession, setAllCalenderSession] = useState([]);
  const [calendarViewEvent, setCalendarViewEvent] = useState<Event>();
  const [sessionsForTheCurrentMonth, setSessionsForTheCurrentMonth] = useState<any>([]);
  const [lastFocusedDayElement, setLastFocusedDayElement] = useState<any>();
  const [lastSelectedDate, setLastSelectedDate] = useState("");
  const [singleCalendarView, setSingleCalendarView] = useState(CALENDAR_VIEWS.CALENDAR);
  const [doubleCalendarView, setDoubleCalendarView] = useState(CALENDAR_VIEWS.CALENDAR);
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [viewEnrolledSessionsOnly, setViewEnrolledSessionsOnly] = useState(false);

  const dayOfWeek = [
    GetTranslation("cw.weeks.sun"),
    GetTranslation("cw.weeks.mon"),
    GetTranslation("cw.weeks.tue"),
    GetTranslation("cw.weeks.wed"),
    GetTranslation("cw.weeks.thu"),
    GetTranslation("cw.weeks.fri"),
    GetTranslation("cw.weeks.sat"),
  ];

  const dayOfWeekFullName = [
    GetTranslation("cw.weeks.sunday"),
    GetTranslation("cw.weeks.monday"),
    GetTranslation("cw.weeks.tuesday"),
    GetTranslation("cw.weeks.wednesday"),
    GetTranslation("cw.weeks.thursday"),
    GetTranslation("cw.weeks.friday"),
    GetTranslation("cw.weeks.saturday"),
  ];
  const months = [
    GetTranslation("cw.months.jan"),
    GetTranslation("cw.months.feb"),
    GetTranslation("cw.months.mar"),
    GetTranslation("cw.months.apr"),
    GetTranslation("cw.months.may"),
    GetTranslation("cw.months.jun"),
    GetTranslation("cw.months.jul"),
    GetTranslation("cw.months.aug"),
    GetTranslation("cw.months.sep"),
    GetTranslation("cw.months.oct"),
    GetTranslation("cw.months.nov"),
    GetTranslation("cw.months.dec"),
  ];
  const [locations, setLocations] = useState([]);
  const isSingleCalender = noOfCards === 1;
  const isFilterApplied = selectedCities.size > 0 || viewEnrolledSessionsOnly;
  const totalWidgetWidth = isSingleCalender
    ? CARD_WIDTH_EXCLUDING_PADDING
    : DOUBLE_CARD_WIDTH_EXCLUDING_PADDING;

  useEffect(() => {
    setNoOfCards(widget.layoutAttributes?.cardsToShow || 1);
    widget.attributes!.heading = GetTranslation("text.skipToCalendar");
  }, [doRefresh]);

  useEffect(() => {
    // connected callback
    document.addEventListener("keydown", keydown);

    return () => {
      // disconnected callback
      document.removeEventListener("keydown", keydown);
    };
  }, []);
  useEffect(() => {
    if (enrolledSessionsRef.current) {
      enrolledSessionsRef.current.focus();
    }
  }, [singleCalendarView, doubleCalendarView]);

  const getActiveElement = () => {
    return document.activeElement;
  };

  function processCalendarData(parsedResponse: any) {
    try {
      const tempData = parsedResponse.data.reduce((acc: any, session: any) => {
        const dateStart = session.attributes.dateStart;
        const dateEnd = session.attributes.dateEnd;
        let diffBetweenDays = diffBetweenDates(dateStart, dateEnd, "d");
        diffBetweenDays = diffBetweenDays > DAYS_IN_A_YEAR ? DAYS_IN_A_YEAR : diffBetweenDays;
        if (diffBetweenDays > 0) {
          const endDate = new Date(dateStart);
          const endTime = new Date(dateEnd);
          endDate.setHours(endTime.getHours());
          endDate.setMinutes(endTime.getMinutes());
          let durationPerSession = diffBetweenDates(dateStart, endDate);
          if (durationPerSession <= 0) {
            durationPerSession = ONE_DAY - Math.abs(durationPerSession);
          }
          const today = new Date();
          for (let index = 0; index <= diffBetweenDays; index++) {
            const currentSlotStartDate = add(dateStart, index, "d");
            if (isAfter(today, currentSlotStartDate)) {
              continue;
            }
            const currentSlotEndDate = add(currentSlotStartDate, durationPerSession, "ms");
            if (isAfter(currentSlotEndDate, dateEnd)) {
              break;
            }
            const updatedSession = {
              ...session,
              attributes: {
                ...session.attributes,
                dateEnd: currentSlotEndDate.toISOString(),
                dateStart: currentSlotStartDate.toISOString(),
              },
            };
            acc.push(updatedSession);
          }
        } else {
          acc.push(session);
        }
        return acc;
      }, []);
      parsedResponse.data = tempData;
      parsedResponse = JSON.stringify(parsedResponse);
    } catch (error) {}
    const calendarResponse: any = JsonApiParse(parsedResponse);
    setAllCalenderSession(calendarResponse.userCalendarList);
    return getFormatedSession(calendarResponse.userCalendarList);
  }

  function getFormatedSession(sessions: any[]) {
    const data: { [id: number]: Array<PrimeUserCalendar[]>[] } = {};
    if (!sessions?.length) {
      return data;
    }

    sessions?.forEach((entry: any) => {
      const date = new Date(entry.dateStart);
      const entryDate = date.getDate();
      const entryMonth = date.getMonth();
      const entryYear = date.getFullYear();

      data[entryYear] = data[entryYear] || {};
      data[entryYear][entryMonth] = data[entryYear][entryMonth] || [];
      data[entryYear][entryMonth][entryDate] = data[entryYear][entryMonth][entryDate] || [];
      data[entryYear][entryMonth][entryDate].push(entry);
    });
    return data;
  }
  //remove selected class based on lastSelectedDate
  function removeSelectedClass() {
    document
      .querySelectorAll(`span.${styles.day}`)
      .forEach((el: Element) => el.classList.remove(styles.selected));
  }
  function addSelectedClass(date: string) {
    const element = document.querySelector(`button[data-of-day="${date}"] span.${styles.day}`);
    if (element) {
      element.classList.add(styles.selected);
    }
  }
  function getCPrimeCalendarDataForMonth(year: number, month: number) {
    const calendarDataForYear = cpCalendarData && cpCalendarData[year];

    if (calendarDataForYear) {
      const calendarDataForMonth = calendarDataForYear[month] || [];
      return calendarDataForMonth.map((daySessions: any[]) =>
        daySessions.sort((session1: any, session2: any) => {
          const isSession1Enrolled = session1.enrolled && session1.enrolledToCourseInstance;
          const isSession2Enrolled = session2.enrolled && session2.enrolledToCourseInstance;
          if (isSession1Enrolled && !isSession2Enrolled) {
            return -1;
          }
          if (!isSession1Enrolled && isSession2Enrolled) {
            return 1;
          }
          return (new Date(session1.dateStart) as any) - (new Date(session2.dateStart) as any);
        })
      );
    } else {
      return [];
    }
  }

  // const moveFocusToDetailViewFirstItem = () => {
  //   // await updateComplete;
  //   const selectedClasses = `.${styles.calendarDetailContainer} .${styles.loLink}`;
  //   const firstGoToElement: any =
  //     document.querySelectorAll(selectedClasses)?.[0];
  //   if (firstGoToElement) {
  //     firstGoToElement.focus();
  //   }
  // };

  const moveFocusToDetailViewLastItem = () => {
    //await this.updateComplete;
    const selectedClasses = `.${styles.calendarDetailContainer} .${styles.loLink}`;
    const allLinks = document.querySelectorAll(selectedClasses);
    const lastGoToElement: any = allLinks?.[allLinks?.length - 1];

    if (lastGoToElement) {
      lastGoToElement.focus();
    }
  };

  const keydown = (event: any) => {
    const selectedClasses = `.${styles.calendarDetailContainer} .${styles.loLink}`;
    const allCourseLinks = document.querySelectorAll(selectedClasses);
    if (event.key === "Escape") {
      if (lastFocusedDayElement) {
        lastFocusedDayElement.focus();
        const dateButton = lastFocusedDayElement;
        dateButton.setAttribute("aria-pressed", "false");
      }
      if (noOfCards === 1) {
        handleSessionsListBack();
      }
      if (noOfCards === 2) {
        makeDetailViewNonTabable();
      }
    } else if (
      event.shiftKey &&
      event.key === "Tab" &&
      getActiveElement() &&
      getActiveElement() === allCourseLinks?.[0]
    ) {
      event.preventDefault();
      event.stopPropagation();
      moveFocusToDetailViewLastItem();
    } else if (
      !event.shiftKey &&
      event.key === "Tab" &&
      getActiveElement() &&
      getActiveElement() === allCourseLinks?.[allCourseLinks.length - 1]
    ) {
      event.preventDefault();
      event.stopPropagation();
      moveFocusToDetailViewFirstItem();
    } else if (event.key === "ArrowDown") {
      handleArrowKeys(event, 7, false);
    } else if (event.key === "ArrowRight") {
      handleArrowKeys(event, 1, false);
    } else if (event.key === "ArrowUp") {
      handleArrowKeys(event, 7, true);
    } else if (event.key === "ArrowLeft") {
      handleArrowKeys(event, 1, true);
    }
  };

  const makeDetailViewNonTabable = () => {
    document.querySelectorAll(styles.loLink).forEach((button: Element) => {
      button.setAttribute("tabindex", "-1");
    });
  };

  const daysInMonth = (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return new Date(year, month, 0).getDate();
  };

  const handleArrowKeys = (event: any, days: number, isPastDate: boolean) => {
    const element = getActiveElement();
    if (!element) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const selectedDateStr = element.getAttribute("data-of-day");

    if (selectedDateStr) {
      const selectedDate = new Date(selectedDateStr);
      if (!sessionsForTheCurrentMonth[selectedDate.getDate()]) {
        element.setAttribute("tabindex", "-1");
        element.setAttribute("aria-pressed", "false");
      }
      const dayOfMonth = selectedDate.getDate();
      if (isPastDate) {
        days = days * -1;
        if (dayOfMonth + days < 1) {
          generatePreviousMonth();
          focusDateElement(selectedDate, days);
        } else {
          focusDateElement(selectedDate, days);
        }
      } else {
        if (dayOfMonth + days > daysInMonth(selectedDate)) {
          generateNextMonth();
          focusDateElement(selectedDate, days);
        } else {
          focusDateElement(selectedDate, days);
        }
      }
    }
  };

  const focusDateElement = (date: Date, days: number) => {
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const todaysDateStr = todaysDate.toISOString();

    const todayButton = document.querySelector(`button[data-of-day="${todaysDateStr}"`);
    if (todayButton && !sessionsForTheCurrentMonth[todaysDate.getDate()]) {
      todayButton.setAttribute("tabindex", "-1");
      todayButton.setAttribute("aria-pressed", "false");
    }
    const nextDateStr = new Date(
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    ).toISOString();
    const nextElement: any = document.querySelector(`button[data-of-day="${nextDateStr}"`);
    nextElement?.setAttribute("tabindex", "0");
    nextElement?.focus();
    setLastFocusedDayElement(nextElement);
  };

  async function generateMonthFor(year: number, month: number, focusDates = false) {
    const lastFocusedElement = lastFocusedDayElement! as HTMLElement;
    if (lastFocusedElement) {
      lastFocusedElement.setAttribute("tabindex", "-1");
    }
    const currentMonthSessions: any = getCPrimeCalendarDataForMonth(year, month);
    setSessionsForTheCurrentMonth(currentMonthSessions);

    const givenDate = new Date(year, month);
    const todaysDate = new Date();

    const setTodayInCalendar =
      givenDate.getMonth() === todaysDate.getMonth() &&
      givenDate.getFullYear() === todaysDate.getFullYear()
        ? true
        : false;

    const firstDayOfTheMonth = new Date(year, month).getDay();
    const getTotalNumberOfDaysInThisMonth = 32 - new Date(year, month, 32).getDate();

    const maxRowsInACalendar = 6;
    const maxColumnInACalendar = 7;

    let day = 1;

    const daysTemplate = [];
    let rowsTemplate = [];

    for (let row = 0; row < maxRowsInACalendar; row++) {
      rowsTemplate = [];
      for (
        let col = 0;
        col < maxColumnInACalendar && day <= getTotalNumberOfDaysInThisMonth;
        col++
      ) {
        if (row === 0 && col < firstDayOfTheMonth) {
          rowsTemplate.push(<td className={styles.days}></td>);
        } else {
          const curDate = new Date(year, month, day, 0, 0, 0, 0);
          const dayOfWeek = curDate.getDay();
          const dayStr = dayOfWeekFullName[dayOfWeek];
          const date = curDate.toISOString();
          const isDayCurrentDate = day === todaysDate.getDate() && setTodayInCalendar;
          const dateText = `${dayStr}, ${months[givenDate.getMonth()]} ${day} ${year}`;

          const formattedDate = curDate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const ariaLabel = currentMonthSessions[day]
            ? GetTranslationReplaced("text.calendar.session.planned", dateText)
            : dateText;
          const calendarDayClass = `${styles.day} ${
            isDayCurrentDate ? styles.today : ""
          } ${currentMonthSessions[day] ? styles.hasSession : ""}`;
          if (noOfCards === 2) {
            rowsTemplate.push(
              <>
                <td className={styles.days}>
                  <button
                    id={`primelxp-calendar-date-${date}`}
                    data-automationid={`primelxp-calendar-date-${formattedDate}`}
                    className={styles.dayButton}
                    tabIndex={
                      currentMonthSessions[day]
                        ? 0
                        : setTodayInCalendar
                          ? isDayCurrentDate
                            ? 0
                            : -1
                          : focusDates && day === 1
                            ? 0
                            : -1
                    }
                    aria-current={isDayCurrentDate ? "date" : "false"}
                    onClick={e => showDetailView(e, currentMonthSessions)}
                    data-of-day={date}
                    aria-label={ariaLabel}
                    aria-pressed="false"
                  >
                    <span
                      className={`${styles.calendarDayDouble} ${calendarDayClass}`}
                      aria-hidden="true"
                    >
                      {day}
                    </span>
                  </button>
                </td>
              </>
            );
          } else if (noOfCards === 1) {
            rowsTemplate.push(
              <td className={styles.days}>
                <button
                  id="primelxp-calendar-date-${date}"
                  data-automationid="primelxp-calendar-date-${formattedDate}"
                  className={styles.dayButton}
                  onClick={e => showSingleCalendarDetailView(e)}
                  data-of-day={date}
                  aria-current={isDayCurrentDate ? "date" : "false"}
                  aria-describedby="id-calendar-detail-tooltip"
                  aria-label={ariaLabel}
                  aria-pressed="false"
                  tabIndex={
                    currentMonthSessions[day]
                      ? 0
                      : setTodayInCalendar
                        ? isDayCurrentDate
                          ? 0
                          : -1
                        : focusDates && day == 1
                          ? 0
                          : -1
                  }
                >
                  <span className={calendarDayClass} aria-hidden="true">
                    {day}
                  </span>
                </button>
              </td>
            );
          }
          day++;
        }
      }
      if (rowsTemplate.length > 0) {
        daysTemplate.push(<tr style={{ display: "flex", width: "100%" }}>{rowsTemplate}</tr>);
      }
    }
    setDaysTemplate(daysTemplate);
  }

  const toggleCitySelection = (name: string) => {
    const updatedCities = new Set(selectedCities);

    if (updatedCities.has(name)) {
      updatedCities.delete(name);
    } else {
      updatedCities.add(name);
    }

    setSelectedCities(updatedCities);
  };

  async function showDetailView(event: any, sessionsForTheCurrentMonth: any) {
    removeSelectedClass();

    const currentTarget = event.currentTarget;
    const lastTarget: any = lastFocusedDayElement;
    let lastSelectedDateCopy = lastSelectedDate;
    if (lastTarget) {
      lastSelectedDateCopy = new Date(lastTarget.getAttribute("data-of-day")).getDate().toString();
      setLastSelectedDate(lastSelectedDateCopy);
      if (!sessionsForTheCurrentMonth[lastSelectedDateCopy]) {
        lastTarget.setAttribute("tabindex", "-1");
        lastTarget.setAttribute("aria-pressed", "false");
      }
    }
    setLastFocusedDayElement(currentTarget);
    setLastSelectedDate(currentTarget?.getAttribute("data-of-day"));
    currentTarget?.setAttribute("tabindex", "0");
    currentTarget?.setAttribute("aria-pressed", "true");
    addSelectedClass(currentTarget?.getAttribute("data-of-day"));

    const day: number = new Date(currentTarget?.getAttribute("data-of-day")).getDate();
    const entries: Array<Record<string, unknown>> = sessionsForTheCurrentMonth[day]
      ? sessionsForTheCurrentMonth[day]
      : [];

    generateDetailView(entries, day);
    //useEffect -> LastSelectedDate,LastFocusedDayElement

    // if (lastTarget !== currentTarget) {
    //   scrollToTopOfDetailView(".primelxp-calendar-detail-body");
    // }
  }
  useEffect(() => {
    moveFocusToDetailViewFirstItem();
    makeDetailViewTabable();
    scrollToTopOfDetailView(`.${styles.detailBody}`);
  }, [lastFocusedDayElement]);

  function moveFocusToDetailViewFirstItem() {
    const selectedClasses = `.${styles.calendarDetailContainer} .${styles.loLink}`;
    const firstGoToElement: any = document.querySelectorAll(selectedClasses)?.[0];
    if (firstGoToElement) {
      firstGoToElement.focus();
    }
  }
  function makeDetailViewTabable() {
    document.querySelectorAll(`.${styles.loLink}`).forEach((button: Element) => {
      button.setAttribute("tabindex", "0");
    });
  }
  function scrollToTopOfDetailView(selector: string) {
    const element = document.querySelector(selector);

    if (element && element.scrollTop) {
      element.scrollTop = 0;
    }
  }
  function getLoViewRefLink(entry: PrimeUserCalendar) {
    const learningObject = entry.course;
    const loType = learningObject.loType;
    const loId = learningObject.id;
    switch (loType) {
      case "course":
        const instanceClicked = learningObject.instances.filter(loInstance => {
          return loInstance.localizedMetadata[0].name === entry.courseInstanceName;
        });
        const instanceIdClicked =
          instanceClicked.length > 0 ? instanceClicked[0].id.split("_")[1] : "";
        if (entry.enrolled && !entry.enrolledToCourseInstance) {
          return `${GetShowCourseInstancePreviewPageLink()}?courseId=${loId}&instanceId=${instanceIdClicked}`;
        }
        return instanceIdClicked
          ? `${GetCourseInstancePreviewPageLink()}?courseId=${loId}&instanceId=${instanceIdClicked}`
          : `${GetCoursePageLink()}?courseId=${loId}`;
      case "learningProgram":
        return `${GetLPPageLink()}?lpId=${loId}`;
      case "certification":
        return `${GetCertPageLink()}?certId=${loId}`;
      case "jobAid":
        return null;
      default:
        return null;
    }
  }

  function handleClickOnSessions(entry: PrimeUserCalendar) {
    const config = getWidgetConfig();
    if (!config?.disableLinks) {
      SendLinkEvent(getLoViewRefLink(entry));
    }
  }

  const DetailView = (props: { entry: any; handleClickOnSessions: (entry: any) => void }) => {
    const { entry } = props;
    const { listThumbnailBgStyle } = useCardIcon(entry.course, INSTANCE_CARD_BACKGROUND_SIZE);
    let imageUrl = entry.course.imageUrl;
    let previewImageClass = styles.loImage;
    let previewImageContainerClass = "";
    const loDetailClass = ""; //need to check - used to disable links

    if (!imageUrl) {
      imageUrl = GetTileImageFromId(entry.course.id);
      previewImageClass = styles.loDefaultImg;
      previewImageContainerClass = styles.loDefaultImgContainer;
    }
    let location = "";
    if (entry.room) {
      location = `${entry.room.roomName}`;
      if (entry.room.city) {
        location += `, ${entry.room.city}`;
      }
    }

    return (
      <div className={styles.loDetail} role="listitem" key={entry.courseName}>
        <div
          className={`${styles.loImageContainer} ${previewImageContainerClass}`}
          style={{ ...listThumbnailBgStyle }}
        >
          {entry.imageUrl ? (
            <img
              className={previewImageClass}
              src={entry.imageUrl}
              alt={GetTranslationReplaced("cw.aria.label.image.of.course", entry.courseName)}
            />
          ) : (
            ""
          )}
        </div>
        <div className={styles.loDescriptionContainer}>
          <div className={styles.overflowEllipsis}>
            <span className={styles.loSessiontime}>
              {GetFormattedSessionTimeForCalendar(entry.dateStart, entry.dateEnd, locale)}
            </span>
            {entry.location ? (
              <>
                <div className={styles.separatorDot}></div>
                <div className={styles.loSessiontime} title={entry.location}>
                  {entry.location}
                </div>
              </>
            ) : (
              ""
            )}
          </div>
          <div
            className={styles.loSessionName}
            id={`sessionname-${entry.sessionName}`}
            data-automationid={`sessionname-${entry.sessionName}`}
            title={`sessionname-${entry.sessionName}`}
          >
            {entry.sessionName}
          </div>
          <button
            className={`${styles.loCourseName} ${styles.loDetailClass}`}
            onClick={() => handleClickOnSessions(entry)}
            id={`coursename-${entry.courseName}`}
            data-automationid={`coursename-${entry.courseName}`}
            title={`coursename-${entry.courseName}`}
          >
            {entry.courseName}
          </button>
          <div className={styles.loDescriptionCourseType}>
            {entry.enrolled && entry.enrolledToCourseInstance ? (
              entry.course.enrollment?.state === "PENDING_APPROVAL" ||
              entry.course.enrollment?.state === "PENDING_ACCEPTANCE" ? (
                <div
                  className={`${styles.loState} ${styles.pending}`}
                  id={`lo-state-${entry.courseName}`}
                  data-automationid={`lo-state-${entry.courseName}`}
                >
                  <div className={styles.pendingIndicator}></div>
                  {GetTranslation("cw.session.pending")}
                </div>
              ) : (
                <div
                  className={`${styles.loState} ${styles.loCoursesType} ${styles.enrolled}`}
                  id={`lo-state-${entry.courseName}`}
                  data-automationid={`lo-state-${entry.courseName}`}
                >
                  <div className={styles.enrolledIndicator}></div>
                  {GetTranslation("cw.session.enrolled")}
                </div>
              )
            ) : (
              <div
                className={styles.loSessionType}
                title={
                  entry.courseType === "VC"
                    ? GetTranslation("cw.lo.session.type.vc", true)
                    : GetTranslation("cw.lo.session.type.cr", true)
                }
              >
                <label className={styles.loCoursesType}>
                  {entry.courseType === "VC"
                    ? TransformToUpperCase(GetTranslation("cw.lo.session.type.vc", true), locale)
                    : TransformToUpperCase(GetTranslation("cw.lo.session.type.cr", true), locale)}
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  function generateDetailView(entriesForDate: Array<Record<string, unknown>>, day: number) {
    const detailViewTemplate = [];

    if (!entriesForDate.length) {
      detailViewTemplate.push(emptyCalendar());
    }

    entriesForDate.forEach((entry: any) => {
      const loDetailClass = ""; // need to check
      detailViewTemplate.push(
        <DetailView entry={entry} handleClickOnSessions={handleClickOnSessions} />
      );
    });
    //Adds gradient
    // if (detailViewTemplate.length >= 4) {
    //   detailViewTemplate.push(
    //     <div
    //       style={{
    //         position: "sticky",
    //         zIndex: "1",
    //         bottom: "0",
    //         background:
    //           "linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.79) 84.5%)",
    //         height: "15px",
    //       }}
    //     ></div>
    //   );
    // }

    // bug - month changes
    setDetailViewTemplate(detailViewTemplate);
    setDetailViewTitle({
      ...detailViewTitle,
      day: day,
      month: months[month],
      year: year,
    });
  }

  async function showSingleCalendarDetailView(event: any) {
    const eventCopy = { ...event };
    setSingleCalendarView(CALENDAR_VIEWS.SESSIONS);
    setCalendarViewEvent(eventCopy);
  }
  useEffect(() => {
    if (calendarViewEvent) {
      showDetailView(calendarViewEvent, sessionsForTheCurrentMonth);
    }
  }, [calendarViewEvent]);
  async function generateNextMonth(focusDates = false): Promise<void> {
    let yearCopy = year;
    let monthCopy = month;
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
      yearCopy++;
    } else {
      setMonth(month + 1);
      monthCopy++;
    }
    await generateMonthFor(yearCopy, monthCopy, focusDates);
  }

  async function generatePreviousMonth(focusDates = false): Promise<void> {
    let prevMonth;
    let yearLoc = year;
    if (month === 0) {
      prevMonth = 11;
      yearLoc = year - 1;
    } else {
      prevMonth = month - 1;
    }
    setMonth(prevMonth);
    setYear(yearLoc);
    await generateMonthFor(yearLoc, prevMonth, focusDates);
  }
  async function getData() {
    const userResponse = await getALMUser();
    const userId = userResponse?.user?.id;
    const calendardata = await getCPrimeCalendarData(userId!);
    const locations = await getCities();
    setCpCalendarData(processCalendarData(calendardata));
    setLocations(locations);
  }

  // Rest of your code
  useEffect(() => {
    // if (!config) return;
    getData();
    const todaysDate = new Date().getDate();
    generateDetailView(
      sessionsForTheCurrentMonth[todaysDate] ? sessionsForTheCurrentMonth[todaysDate] : [],
      todaysDate
    );
  }, [allCalenderSession?.length]);

  useEffect(() => {
    const currentMonthSessions: any = getCPrimeCalendarDataForMonth(year, month);
    if (singleCalendarView) {
      generateMonthFor(year, month);
    }
    const todaysDate = new Date().getDate();
    generateDetailView(
      currentMonthSessions[todaysDate] ? currentMonthSessions[todaysDate] : [],
      todaysDate
    );
  }, [cpCalendarData]);

  useEffect(() => {
    generateMonthFor(year, month);
    // generate detail view
  }, [month, year]);

  function handleFilterClick(view: any) {
    if (isSingleCalender) {
      setSingleCalendarView(view);
      return;
    }
    setDoubleCalendarView(view);
  }

  const keyDownBind = (event: any) => keydown(event);

  const handleApplyFilterClick = () => {
    const allSessions = allCalenderSession;
    let filteredSessions: any[] = [];
    if (allSessions) {
      filteredSessions = allCalenderSession;
    }
    if (selectedCities.size !== 0) {
      filteredSessions = filteredSessions.filter((session: PrimeUserCalendar) => {
        return selectedCities.has(session?.room?.city);
      });
    }
    if (viewEnrolledSessionsOnly) {
      filteredSessions = filteredSessions.filter((session: PrimeUserCalendar) => {
        return session.enrolled && session.enrolledToCourseInstance;
      });
    }
    setCpCalendarData(getFormatedSession(filteredSessions));
    handleFilterClick(CALENDAR_VIEWS.CALENDAR);
  };

  const viewEnrolledSessionChange = () => {
    setViewEnrolledSessionsOnly(prevState => !prevState); //change to not of prevState
  };

  const emptyCalendar = () => {
    return (
      <div className={styles.calendarEmptyBody}>
        <div className={styles.calendarEmptyBodyIcon}>{EMPTY_STATE_CARD()}</div>
        <div
          className={styles.calendarEmptyBodyString}
          data-automationid="primelxp-calendar-nosessions"
        >
          {GetTranslation("cw.empty.detail.message")}
        </div>
      </div>
    );
  };
  function renderCalendarView(containerWidth: string, calendarBodyExtraClass = "") {
    return (
      <div className={styles.calendarContainer} style={{ width: containerWidth }}>
        <div
          id="id-calendar-header-title"
          data-automationid="id-calendar-header-title"
          role="heading"
          aria-level={2}
          className={styles.srOnly}
          aria-label={GetTranslation("cw.aria.label.calendar.body")}
        ></div>
        {/* <div > */}
        <h2 className={styles.calendarHeader} role="presentation">
          <button
            tabIndex={0}
            aria-label={GetTranslation("cw.aria.label.pre.month")}
            onClick={() => generatePreviousMonth(true)}
            className={styles.previousMonth}
            data-automationid="calendar-previous-month"
          >
            <div className={styles.leftArrow}></div>
          </button>
          <div
            className={styles.calendarHeaderTitle}
            title={`${GetTranslationsReplaced("cw.calendar.view.title", {
              month: months[month],
              year: year,
            })}`}
          >
            {GetTranslationsReplaced("cw.calendar.view.title", {
              month: months[month],
              year: year,
            })}
          </div>
          <button
            tabIndex={0}
            aria-label={GetTranslation("cw.aria.label.next.month")}
            onClick={() => generateNextMonth(true)}
            id={styles.nextMonth}
            data-automationid="nextMonth"
          >
            <div className={styles.rightArrow}></div>
          </button>
        </h2>

        <table className={styles.calendarBody} role="grid">
          <thead className={styles.weeksContainer}>
            {dayOfWeek.map((day, index) => (
              <th scope="col" className={styles.calendarWeeks} key={`${day}${index}`}>
                {day}
              </th>
            ))}
          </thead>
          <tbody className={styles.daysContainer}>{daysTemplate}</tbody>
        </table>
        <div className={`${styles.sessionFilter} ${styles.containerPadding}`}>
          <button
            className={styles.filterBtn}
            tabIndex={0}
            aria-label={GetTranslation("cw.filter.session")}
            onClick={() => handleFilterClick(CALENDAR_VIEWS.FILTER)}
            id="calendar-filter-sessions"
            data-automationid="calendar-filter-sessions"
          >
            <span className={`${styles.filterIcon} ${isFilterApplied ? styles.dot : ""}`}>
              {FILTER_ICON()}
            </span>
            {GetTranslation("cw.filter.session")}
          </button>
        </div>
      </div>
    );
  }
  function renderSessionsListView(containerWidth: "100%" | "50%") {
    return (
      <div
        className={`${styles.calendarDetailContainer} ${styles.containerPadding}`}
        style={{ width: containerWidth }}
        id={`${detailViewTitle.month}_${detailViewTitle.day}_${detailViewTitle.year}`}
        data-automationid={`${detailViewTitle.month}_${detailViewTitle.day}_${detailViewTitle.year}`}
      >
        <div
          role="none"
          className={styles.srOnly}
          aria-label={GetTranslation("cw.aria.label.instruction.to.enter.tooltip.detail.body")}
        ></div>
        <div className={styles.calendarDetailHeader}>
          {isSingleCalender ? (
            <button
              tabIndex={0}
              className={styles.previousMonth}
              aria-label={GetTranslation("cw.aria.label.pre.month")}
              onClick={() => handleSessionsListBack()}
              data-automationid="calendar-previous-month"
            >
              <div className={styles.leftArrow}></div>
            </button>
          ) : (
            ""
          )}
          <div
            className={styles.calendarDetailHeaderTitle}
            title={GetTranslationsReplaced("cw.detail.view.date.title", {
              month: detailViewTitle.month,
              day: detailViewTitle.day,
              year: detailViewTitle.year,
            })}
          >
            <time>
              {GetTranslationsReplaced("cw.detail.view.date.title", {
                month: detailViewTitle.month,
                day: detailViewTitle.day,
                year: detailViewTitle.year,
              })}
            </time>
          </div>
        </div>
        <div
          className={styles.detailBody}
          aria-label={GetTranslation("text.calendar.planned.sessions")}
          role="list"
        >
          {detailViewTemplate}
        </div>
        <div
          role="none"
          className={styles.srOnly}
          aria-label={GetTranslation("cw.aria.label.instruction.to.leave.tooltip.detail.body")}
        ></div>
      </div>
    );
  }
  function handleSessionsListBack() {
    setSingleCalendarView(CALENDAR_VIEWS.CALENDAR);
  }

  // //review this function
  // function goToSessionsView(){
  //   let noCities:any = new Set()
  //   //restore previous state
  //   setViewEnrolledSessionsOnly(prevState=>prevState);
  //   handleFilterClick(CALENDAR_VIEWS.CALENDAR);
  // }

  function renderFilterView() {
    return (
      <div
        className={`${styles.calendarfilterContainer} ${styles.containerPadding}`}
        style={{ width: "100%" }}
        id={`${detailViewTitle.month}_${detailViewTitle.day}_${detailViewTitle.year}`}
        data-automationid={`${detailViewTitle.month}_${detailViewTitle.day}_${detailViewTitle.year}`}
      >
        <div
          role="none"
          className={styles.srOnly}
          aria-label={GetTranslation("cw.aria.label.instruction.to.enter.tooltip.detail.body")}
        ></div>
        <div className={styles.calendarDetailHeader}>
          <div className={styles.calendarDetailHeaderTitle}>
            {GetTranslation("cw.filter.session")}
          </div>
        </div>
        <div
          className={styles.detailBody}
          aria-label={GetTranslation("text.calendar.planned.sessions")}
          role="list"
        >
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="view-enrolled-only"
              onClick={() => viewEnrolledSessionChange()}
              checked={viewEnrolledSessionsOnly}
              className={styles.filterCheckbox}
              ref={enrolledSessionsRef}
            />
            <label htmlFor="view-enrolled-only">
              {GetTranslation("cw.filter.viewEnrolledSessionOnly")}
            </label>
          </div>
          <div className={styles.horizontalSeparator}></div>
          {locations.length > 0 ? (
            <div>
              <div className={styles.filterLocationList}>
                {GetTranslation("cw.filter.trainingLocations")}
              </div>
              <div>
                {locations.map(location => (
                  <div className={styles.checkboxItem} key={location}>
                    <input
                      type="checkbox"
                      id={location}
                      checked={selectedCities?.has(location)}
                      onClick={() => toggleCitySelection(location)}
                      className={styles.filterCheckbox}
                    />
                    <label className={styles.overflowEllipsis} title={location} htmlFor={location}>
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className={styles.sessionFilter}>
          <button
            className={styles.applyFilter}
            aria-label={GetTranslation("cw.filter.apply")}
            onClick={() => handleApplyFilterClick()}
            id="calendar-apply-filter"
            data-automationid="calendar-apply-filter"
          >
            {GetTranslation("cw.filter.apply")}
            {/* <span className="primelxp-calendar-right-arrow"></span> */}
          </button>
        </div>
        <div
          role="none"
          className={styles.srOnly}
          aria-label={GetTranslation("cw.aria.label.instruction.to.leave.tooltip.detail.body")}
        ></div>
      </div>
    );
  }

  function renderSingleViewCalendar() {
    let viewToRender = <div></div>;

    switch (singleCalendarView) {
      case CALENDAR_VIEWS.CALENDAR:
        viewToRender = renderCalendarView(`100%`, styles.calendarBodySingle);
        break;
      case CALENDAR_VIEWS.FILTER:
        viewToRender = renderFilterView();
        break;
      case CALENDAR_VIEWS.SESSIONS:
        viewToRender = renderSessionsListView(`100%`);
        break;
    }
    return (
      <section
        className={styles.widgetContainer}
        role="complementary"
        aria-labelledby="id-calendar-header-title"
        style={{ width: `${totalWidgetWidth}px`, height: `${cardHeight}px` }}
      >
        {viewToRender}
      </section>
    );
  }
  function renderDoubleViewCalendar() {
    let viewToRender = <div></div>;

    switch (doubleCalendarView) {
      case CALENDAR_VIEWS.CALENDAR:
        viewToRender = (
          <>
            {renderCalendarView("50%")}
            <div role="separator" className={styles.separator}></div>
            {renderSessionsListView("50%")}
          </>
        );
        break;
      case CALENDAR_VIEWS.FILTER:
        viewToRender = renderFilterView();
        break;
    }
    return (
      <section
        className={styles.widgetContainer}
        role="complementary"
        aria-labelledby="id-calendar-header-title"
        style={{
          width: `${totalWidgetWidth}px`,
          height: `${cardHeight}px`,
        }}
      >
        {viewToRender}
      </section>
    );
  }

  const calendarStr = GetTranslation("calendar");
  return (
    <ALMErrorBoundary>
      <div>
        <h2
          data-automationid="calendar-header"
          aria-labelledby={calendarStr}
          className={styles.header}
          data-skip-link-target={widget.layoutAttributes?.id}
          tabIndex={0}
        >
          {calendarStr}
        </h2>
        {isSingleCalender ? renderSingleViewCalendar() : renderDoubleViewCalendar()}
      </div>
    </ALMErrorBoundary>
  );
};

export default CalendarWidget;
