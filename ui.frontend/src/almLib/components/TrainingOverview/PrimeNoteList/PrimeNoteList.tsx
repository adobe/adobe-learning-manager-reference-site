import { PrimeLearningObject, PrimeLearningObjectInstance, PrimeLearningObjectResource, PrimeNote } from "../../../models/PrimeModels";
import styles from "./PrimeNoteList.module.css";
import { PrimeNoteItem } from "../PrimeNoteItem";

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
  deleteNote: (
    noteId: string,
    loId: string,
    loResourceId: string
  ) => Promise<void | undefined>;
  launchPlayerHandler: Function;
}> = (props) => {
  const { training, trainingInstance, notes, updateNote, deleteNote, launchPlayerHandler } =
    props;

  return (
    <div>
        <div className={styles.moduleNotesContainer}>
          <div className={styles.noteItemList}>
            {notes.map((note, id) => (
              <PrimeNoteItem
                training={training}
                trainingInstance={trainingInstance}
                note={note}
                key={note.id}
                updateNote={updateNote}
                deleteNote={deleteNote}
                launchPlayerHandler={launchPlayerHandler}
              ></PrimeNoteItem>
            ))}
          </div>
        </div>
    </div>
  );
};
export default PrimeNoteList;
