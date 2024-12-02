import React, { useRef, useState } from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeNote,
} from "../../../models/PrimeModels";
import styles from "./PrimeNoteItem.module.css";
import { GetTranslation, GetTranslationReplaced } from "../../../utils/translationService";
import { getEnrolledInstancesCount } from "../../../utils/hooks";
import { AUDIO, CP, DOC, ELEARNING, PDF, PPT, PR, VIDEO, XLS } from "../../../utils/constants";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { NOTE_ICON } from "../../../utils/inline_svg";
import { extractTrainingIdNum } from "../../../utils/lo-utils";

const DEFAULT_TIME = 0;
const MINUTES_TO_MILLISECONDS = 60 * 1000;

const PrimeNoteItem: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  note: PrimeNote;
  updateNote: (
    note: PrimeNote,
    updatedText: string,
    loId: string,
    loResourceId: PrimeLearningObjectResource
  ) => Promise<void | undefined>;
  deleteNote: (noteId: string, loId: string, loResourceId: string) => Promise<void | undefined>;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  updatePlayerLoState: Function;
  childLpId: string;
}> = props => {
  const [almAlert] = useAlert();
  const {
    training,
    trainingInstance,
    note,
    updateNote,
    deleteNote,
    launchPlayerHandler,
    isPartOfLP,
    isPartOfCertification,
    updatePlayerLoState,
    childLpId,
  } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMarkerIndexPresent = note.marker ? true : false;
  let noteContainer = styles.noteContentWithoutMarker;
  let noteTextClass = styles.noteTextWithoutMarker;
  let editContent = styles.noteEditContentWithoutMarker;
  let controlActions = styles.noteControlActionsWithoutMarker;
  let noteWithoutMarker = styles.noteContainerWithoutMarker;
  if (isMarkerIndexPresent) {
    noteContainer = styles.noteMarkerContainer;
    noteTextClass = styles.noteContent;
    editContent = styles.noteEditContent;
    controlActions = styles.noteControlActions;
    noteWithoutMarker = styles.noteContentWithMarker;
  }
  const [isEditMode, setIsEditMode] = useState(false);
  const [valueOfNotes, setValueOfNotes] = useState(note.text);
  const editNotesHandler = () => {
    setIsEditMode((prevState: boolean) => !prevState);
  };
  const updateNoteHandler = () => {
    setIsEditMode(false);
    updateNote(note, valueOfNotes, training.id, noteLoResource);
  };
  const deleteNoteHandler = () => {
    setIsEditMode(false);
    deleteNote(note.id, training.id, noteLoResource.id);
  };
  const editView = () => {
    return (
      <div className={noteWithoutMarker} data-automationid={`${valueOfNotes}-content`}>
        <textarea
          id="noteEditor"
          className={editContent}
          value={valueOfNotes}
          onChange={e => setValueOfNotes(e.target.value)}
          rows={5}
        ></textarea>
        <div className={controlActions}>
          <button
            className={styles.actionButton}
            onClick={deleteNoteHandler}
            data-automationid={`${valueOfNotes}-delete-button`}
          >
            {GetTranslation("alm.text.delete")}
          </button>
          <button
            className={styles.actionButton}
            onClick={valueOfNotes.trim() !== "" ? updateNoteHandler : deleteNoteHandler}
            data-automationid={`${valueOfNotes}-update-button`}
          >
            {GetTranslation("alm.text.done")}
          </button>
        </div>
      </div>
    );
  };

  const noteLoResource = note.loResource;
  const multipleAttempt = noteLoResource?.multipleAttempt;
  const timeBetweenAttempts = multipleAttempt?.timeBetweenAttempts || 0;
  const stopAttemptOnCompletion = multipleAttempt?.stopAttemptOnSuccessfulComplete;
  const filteredResourceGrades = trainingInstance.enrollment?.loResourceGrades?.filter(
    loResourceGrade => loResourceGrade.id.search(noteLoResource?.id) !== -1
  );
  const learnerAttemptInfo = noteLoResource?.learnerAttemptInfo;
  const multipleAttemptEnabled = noteLoResource?.multipleAttemptEnabled;

  const loResourceGrade = filteredResourceGrades?.length
    ? filteredResourceGrades[0]
    : ({} as PrimeLearningObjectResourceGrade);

  const moduleLockedBetweenAttempt = () => {
    const lastAttemptEndTime =
      new Date(
        learnerAttemptInfo?.currentAttemptEndTime || learnerAttemptInfo?.lastAttemptEndTime || 0
      ).getTime() || DEFAULT_TIME;

    const attemptStartTime = lastAttemptEndTime + timeBetweenAttempts * MINUTES_TO_MILLISECONDS;
    const now = new Date().getTime();
    return now < attemptStartTime;
  };
  const isPartOfParentLO = isPartOfLP || isPartOfCertification;

  const noteClickHandler = (event: any) => {
    const isModuleLocked =
      multipleAttemptEnabled && learnerAttemptInfo && moduleLockedBetweenAttempt();
    const isModuleCompleted = stopAttemptOnCompletion && loResourceGrade?.hasPassed;

    if (isModuleLocked) {
      almAlert(true, GetTranslation("alm.mqa.module.locked.message"), AlertType.error);
      return;
    }

    if (isModuleCompleted) {
      return;
    }

    if (isPartOfParentLO) {
      // Update root training player state -> sending last playing child lp and course
      updatePlayerLoState({
        body: {
          lastPlayingChildLp: extractTrainingIdNum(childLpId),
          lastPlayingCourse: extractTrainingIdNum(training.id),
        },
      });
    }

    launchPlayerHandler({
      id: training.id,
      moduleId: noteLoResource.id,
      trainingInstanceId: trainingInstance.id,
      isMultienrolled: isMultienrolled,
      note_id: note.id,
      note_position: note.marker,
    });
  };

  const defaultView = () => {
    return (
      <div
        title={GetTranslation("alm.text.clickToEdit")}
        className={noteTextClass}
        onClick={editNotesHandler}
        data-automationid={`${valueOfNotes}-content`}
      >
        {valueOfNotes}
      </div>
    );
  };

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time.toString();
  };

  const formattedNoteMarker = (note: PrimeNote) => {
    const moduleType = noteLoResource?.resourceType;
    const contentType = noteLoResource?.resources?.[0]?.contentType;
    const note_marker = parseInt(note.marker);

    if (moduleType !== ELEARNING) {
      return;
    }
    if (
      contentType === CP ||
      contentType === PR ||
      contentType === VIDEO ||
      contentType === AUDIO
    ) {
      const hours = Math.floor(note_marker / 3600);
      const minutes = Math.floor(note_marker / 60) - Math.floor(60 * hours);
      const seconds = Math.floor((note_marker % 3600) % 60);

      const str_hours = hours !== 0 ? formatTime(hours) : "";
      const str_minutes = formatTime(minutes);
      const str_seconds = formatTime(seconds);

      let noteMarker = str_hours ? `${str_hours}:` : "";
      noteMarker += `${str_minutes}:${str_seconds}`;

      noteMarker =
        hours !== 0
          ? GetTranslationReplaced("alm.text.hrs", noteMarker)
          : str_minutes === "00"
            ? GetTranslationReplaced("alm.text.secs", noteMarker)
            : GetTranslationReplaced("alm.text.mins", noteMarker);

      return noteMarker;
    } else if (
      contentType === PDF ||
      contentType === DOC ||
      contentType === PPT ||
      contentType === XLS
    ) {
      return GetTranslationReplaced("alm.text.page", `${note.marker}`);
    }
    return;
  };

  const markerText = formattedNoteMarker(note);

  const isMultienrolled = getEnrolledInstancesCount(training) > 1;
  return (
    <React.Fragment key={`note-${note.id}`}>
      <div className={noteContainer}>
        <span
          aria-hidden="true"
          className={styles.noteIcon}
          data-automationid={`${markerText}-noteIcon`}
        >
          {NOTE_ICON()}
        </span>
        {isMarkerIndexPresent ? (
          <>
            <span
              className={styles.markerText}
              onClick={noteClickHandler}
              data-automationid={`${markerText}-noteMarker`}
            >
              {markerText}
            </span>
          </>
        ) : (
          <></>
        )}
        {isEditMode ? editView() : defaultView()}
      </div>
    </React.Fragment>
  );
};
export default PrimeNoteItem;
