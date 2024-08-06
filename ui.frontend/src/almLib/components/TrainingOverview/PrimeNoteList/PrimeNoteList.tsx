import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeNote,
} from "../../../models/PrimeModels";
import styles from "./PrimeNoteList.module.css";
import { PrimeNoteItem } from "../PrimeNoteItem";
import React from "react";

const PrimeNoteList: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  notes: PrimeNote[];
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
  const {
    training,
    trainingInstance,
    notes,
    updateNote,
    deleteNote,
    launchPlayerHandler,
    isPartOfLP,
    isPartOfCertification,
    updatePlayerLoState,
    childLpId,
  } = props;

  const lastNoteIndex = notes.length - 1;

  return (
    <div className={styles.moduleNotesContainer}>
      <div className={styles.noteItemList}>
        {notes.map((note, index) => (
          <React.Fragment key={note.id}>
            <PrimeNoteItem
              training={training}
              trainingInstance={trainingInstance}
              note={note}
              key={note.id}
              updateNote={updateNote}
              deleteNote={deleteNote}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              isPartOfCertification={isPartOfCertification}
              updatePlayerLoState={updatePlayerLoState}
              childLpId={childLpId}
            ></PrimeNoteItem>
            {index !== lastNoteIndex && <hr className={styles.notesItemSeparator} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default PrimeNoteList;
