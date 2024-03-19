import React, { useEffect, useState } from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeNote,
} from "../../../models/PrimeModels";
import styles from "./PrimeNoteItem.module.css";
import Note from "@spectrum-icons/workflow/Note";
import {
  GetTranslation,
  GetTranslationReplaced,
} from "../../../utils/translationService";
import { getEnrolledInstancesCount } from "../../../utils/hooks";
import { AUDIO, CP, DOC, ELEARNING, PDF, PPT, PR, VIDEO, XLS } from "../../../utils/constants";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";

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
  deleteNote: (
    noteId: string,
    loId: string,
    loResourceId: string
  ) => Promise<void | undefined>;
  launchPlayerHandler: Function;
}> = (props) => {
  const [almAlert] = useAlert();
  const { training, trainingInstance, note, updateNote, deleteNote, launchPlayerHandler } = props;
  const isMarkerIndexPresent = note.marker ? true : false;
  let noteContainer = styles.noteContentWithoutMarker;
  let noteTextClass = styles.noteTextWithoutMarker;
  let editContent = styles.noteEditContentWithoutMarker;
  let controlActions = styles.noteControlActionsWithoutMarker;
  let noteWithoutMarker = styles.noteContainerWithoutMarker;
    if(isMarkerIndexPresent){
      noteContainer = styles.noteMarkerContainer;
      noteTextClass = styles.noteContent;
      editContent = styles.noteEditContent;
      controlActions = styles.noteControlActions;
      noteWithoutMarker = "";
    }
  const [isEditMode, setIsEditMode] = useState(false);
  const [valueOfNotes, setValueOfNotes] = useState(note.text);
  const editNotesHandler = () => {
    setIsEditMode((prevState: boolean) => !prevState);
  };
  const updateNoteHandler = () => {
    setIsEditMode(false);
    updateNote(note, valueOfNotes, training.id, note.loResource);
  };
  const deleteNoteHandler = () => {
    setIsEditMode(false);
    deleteNote(note.id, training.id, note.loResource.id);
  };
  const editView = () => {
    return (
      <div className={noteWithoutMarker}>
        <input
          className={editContent}
          type="text"
          value={valueOfNotes}
          onChange={(e) => setValueOfNotes(e.target.value)}
        ></input>
        <div className={controlActions}>
          <button className={styles.actionButton} onClick={valueOfNotes.trim() !== '' ? updateNoteHandler : deleteNoteHandler}>
            {GetTranslation("alm.text.done")}
          </button>
          <button className={styles.actionButton} onClick={deleteNoteHandler}>
            {GetTranslation("alm.text.delete")}
          </button>
        </div>
      </div>
    );
  };

  const multipleAttempt = note.loResource?.multipleAttempt;
  const timeBetweenAttempts = multipleAttempt?.timeBetweenAttempts || 0;
  const stopAttemptOnSuccessfulComplete = multipleAttempt?.stopAttemptOnSuccessfulComplete;
  const filteredResourceGrades = trainingInstance.enrollment?.loResourceGrades.filter(
    (loResourceGrade) => loResourceGrade.id.search(note.loResource.id) !== -1
  );

  const loResourceGrade = filteredResourceGrades?.length
    ? filteredResourceGrades[0]
    : ({} as PrimeLearningObjectResourceGrade);

  const moduleLockedBetweenAttempt = ()=>{
    const lastAttemptEndTime = new Date(
      note.loResource.learnerAttemptInfo?.currentAttemptEndTime || note.loResource.learnerAttemptInfo?.lastAttemptEndTime || 0
    ).getTime() || 0;
    
    const attemptStartTime = lastAttemptEndTime + timeBetweenAttempts * 60 * 1000;
    const now = new Date().getTime();
    return now < attemptStartTime;
  };

  const noteClickHandler = (event: any) => {
    if(!(
      note.loResource.multipleAttemptEnabled &&
      note.loResource.learnerAttemptInfo &&
      moduleLockedBetweenAttempt()
    )){

    // Case when module is completed
    if(stopAttemptOnSuccessfulComplete && loResourceGrade?.hasPassed){
      return ;
    }
      launchPlayerHandler({
        id: training.id,
        moduleId: note.loResource.id,
        trainingInstanceId: trainingInstance.id, 
        isMultienrolled: isMultienrolled,
        note_id: note.id,
        note_position: note.marker,
      })
    }
    else{
      almAlert(
        true,
        GetTranslation("alm.mqa.module.locked.message"),
        AlertType.error
      );

    }
  }

  const defaultView = () => {
    return (
      <div
        title={GetTranslation("alm.text.clickToEdit")}
        className={noteTextClass}
        onClick={editNotesHandler}
      >
        {valueOfNotes}
      </div>
    );
  };
  const formattedNoteMarker= (note: PrimeNote)=> {
    const moduleType = note.loResource.resourceType ;
    const contentType = note.loResource.resources[0].contentType ;
    let note_marker = parseInt(note.marker)
    if (moduleType === ELEARNING) {
      if (
        contentType === CP ||
        contentType === PR ||
        contentType === VIDEO ||
        contentType === AUDIO
      ) {
        let noteMarker = '';
        let hours = Math.floor(note_marker / 3600);
        let minutes = Math.floor(note_marker / 60) - Math.floor(60 * hours);
        let seconds = Math.floor((note_marker% 3600) % 60);

        let str_minutes = minutes.toString();
        let str_sec = seconds.toString();

        if (minutes < 10) {
          str_minutes = '0' + minutes;
        }
        if (seconds < 10) {
          str_sec = '0' + seconds;
        }
        if (hours !== 0) {
          let str_hours = '0' + hours.toString();
          if (hours < 10) {
            str_hours = '0' + hours;
          }
          noteMarker = noteMarker + str_hours + ':';
        }
        if (hours !== 0) {
          noteMarker =
            noteMarker + str_minutes + ':' + str_sec + ' hrs';
        } else {
          if (str_minutes === '00') {
            noteMarker =
              noteMarker + str_minutes + ':' + str_sec + ' sec';
          } else {
            noteMarker =
              noteMarker + str_minutes + ':' + str_sec + ' min';
          }
        }
        return noteMarker;
      } else if (
        contentType === PDF ||
        contentType === DOC ||
        contentType === PPT ||
        contentType === XLS
      ) {
        return GetTranslationReplaced("alm.text.page", `${note.marker}`);
      } else {
        return;
      }
    } else if (note.loResource.resourceType === 'ACTIVITY') {
      return;
  }
}

  const isMultienrolled = getEnrolledInstancesCount(training)>1;
  return (
    <React.Fragment key={`note-${note.id}`}>
      <div className={noteContainer}>
        <span aria-hidden="true" className={styles.noteIcon}>
          <Note />
        </span>
        {isMarkerIndexPresent ? (
          <>
            <span
              className={styles.markerText}
              onClick={noteClickHandler}
            >
              {formattedNoteMarker(note)}
            </span>
          </>
        ) : (
          <></>
        )}
        {isEditMode ? editView() : defaultView()}
      </div>

      <div className={styles.noteSeperatorDiv}>
        <div className={styles.noteSeperatorLine}></div>
      </div>
    </React.Fragment>
  );
};
export default PrimeNoteItem;
