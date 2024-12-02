import { GetTranslation, GetTranslationReplaced } from "../../utils/translationService";
import styles from "./ALMLpLeaderBoard.module.css";
import { DEFAULT_USER_AVATAR_SVG } from "../../utils/inline_svg";
const ALMLeaderBoardItem: React.FC<{
  learnerName: string;
  learnerPoints: number;
  learnerRank: number;
  learnerImageUrl: string;
  previousLearnerRank?: number | null;
  isCurrentUser?: boolean;
}> = props => {
  const {
    learnerName,
    learnerPoints,
    learnerRank,
    learnerImageUrl,
    previousLearnerRank,
    isCurrentUser,
  } = props;
  const isExistingRank = learnerRank !== previousLearnerRank;
  const avatarClass = isCurrentUser
    ? `${styles.avatarIcon} ${styles.highlightForCurrentUser}`
    : styles.avatarIcon;
  const learnerAvatar = (learnerImageUrl: string) => {
    return (
      (learnerImageUrl && (
        <img
          className={avatarClass}
          src={learnerImageUrl}
          alt={GetTranslationReplaced("alm.lp.leaderboard.avatar", learnerName)}
        />
      )) || <div className={avatarClass}>{DEFAULT_USER_AVATAR_SVG()}</div>
    );
  };
  return (
    <div
      className={styles.leaderBoardUser}
      data-automationid={`leaderBoardDetailsOf-${learnerName}`}
    >
      {isExistingRank && (
        <div className={styles.leaderBoardUserRank} data-automationid={`Rank of ${learnerName}`}>
          {learnerRank}.
        </div>
      )}
      <div className={isExistingRank ? styles.leaderBoardItem : styles.leaderBoardExistingItem}>
        {learnerAvatar(learnerImageUrl)}

        <div>
          <div className={styles.leaderBoardUserDetails}>{learnerName}</div>
          <div
            className={styles.leaderBoardUserDetails}
            data-automationid={`Points-earned-by-${learnerName}`}
          >
            {learnerPoints} {GetTranslation("alm.text.points")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ALMLeaderBoardItem;
