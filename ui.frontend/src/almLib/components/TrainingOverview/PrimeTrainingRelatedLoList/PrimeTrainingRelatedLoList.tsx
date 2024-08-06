import { PrimeLearningObject } from "../../../models/PrimeModels";
import styles from "./PrimeTrainingRelatedLoList.module.css";
import { PrimeTrainingRelatedLO } from "../PrimeTrainingRelatedLO";
import { Skill } from "../../../models";
const PrimeTrainingRelatedLoList: React.FC<{
  relatedLOs: PrimeLearningObject[];
  skills: Skill[];
  relatedLoText: string;
  showDescription?: string;
  updateBookMark: (isBookmarked: boolean, loId: string) => Promise<void | undefined>;
}> = props => {
  const { relatedLOs, skills, relatedLoText, showDescription, updateBookMark } = props;

  return (
    <>
      <div className={styles.headerText} data-automationid={relatedLoText}>
        {relatedLoText}
      </div>
      {showDescription}
      {relatedLOs.map((relatedLO, id) => (
        <>
          <PrimeTrainingRelatedLO
            relatedLO={relatedLO}
            skills={skills}
            updateBookMark={updateBookMark}
            key={relatedLO.id}
          ></PrimeTrainingRelatedLO>
          {id !== relatedLOs.length - 1 && <div className={styles.seperator}></div>}
        </>
      ))}
    </>
  );
};
export default PrimeTrainingRelatedLoList;
