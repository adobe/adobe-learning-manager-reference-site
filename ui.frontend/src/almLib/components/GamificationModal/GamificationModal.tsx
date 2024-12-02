import styles from "./GamificationModal.module.css";
import { GetTranslation, GetTranslationReplaced } from "../../utils/translationService";
import { getALMObject } from "../../utils/global";
import GAMIFICATION_ICON from "../../assets/images/gamificationModalPoints.svg";
import { ActionButton, Provider, Dialog, Content, DialogContainer } from "@adobe/react-spectrum";
import { getALMConfig, getModalTheme } from "../../utils/global";
const GamificationModal: React.FC<{
  awardedPoints: number;
  closeGamificationModal: () => void;
}> = props => {
  const { awardedPoints, closeGamificationModal } = props;
  const themeData = getALMConfig()?.themeData;

  const goToLeaderBoard = () => {
    getALMObject().navigateToLeaderboardPage();
  };
  return (
    <Provider theme={getModalTheme(themeData?.name)} colorScheme={"light"}>
      <>
        <ActionButton
          id="showAlert"
          UNSAFE_className={styles.primeAlertDialogButton}
        ></ActionButton>
        <DialogContainer onDismiss={closeGamificationModal} isDismissable={true}>
          <Dialog>
            <Content>
              <div className={styles.gamificationModalBody}>
                <div className={styles.gamificationImgContainer}>
                  <img
                    alt={GetTranslation("gamification.points.achieved.img")}
                    src={GAMIFICATION_ICON}
                  />
                  <span className={styles.points}>{awardedPoints}</span>
                </div>
                <div
                  className={styles.gamificationCongratsText}
                  data-automationId="gamificationCongratsMsg"
                >
                  {GetTranslationReplaced("gamification.congrats.msg", awardedPoints.toString())}
                </div>
                <div
                  className={styles.learnerImprovementText}
                  data-automationId="learningImprovementMsg"
                >
                  {GetTranslation("learning.improvement.msg")}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <div className={styles.modalBootstrapDialogBody}>
                  <span className={styles.viewText} data-automationid="footerViewText">
                    {GetTranslation("alm.instance.view")}
                  </span>
                  <a
                    className={styles.leaderBoardLink}
                    href="#"
                    data-automationid="modalLeaderBoardLink"
                    onClick={goToLeaderBoard}
                    aria-label={GetTranslation("gamification.leaderBoard.link")}
                  >
                    {GetTranslation("gamification.text.leaderboard", true)}
                  </a>
                </div>
                <div>
                  <button
                    className={styles.modalPrimaryButton}
                    data-automationid="close"
                    onClick={closeGamificationModal}
                  >
                    <div>{GetTranslation("text.gamification.awesome")}</div>
                  </button>
                </div>
              </div>
            </Content>
          </Dialog>
        </DialogContainer>
      </>
    </Provider>
  );
};

export default GamificationModal;
