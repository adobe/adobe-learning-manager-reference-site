import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { PrimeBoard } from "../../../models/PrimeModels";
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import styles from "./PrimeCommunityBoardsContainer.module.css";
const PrimeCommunityBoardsContainer: React.FC<{
  boards: PrimeBoard[] | null;
  loadMoreBoards: () => void;
  hasMoreItems: boolean;
}> = ({ boards, loadMoreBoards, hasMoreItems }) => {
  const listHtml = boards?.map((board) => (
    <PrimeCommunityBoard board={board} key={board.id}></PrimeCommunityBoard>
  ));

  return (
    <div>
      {listHtml}
      <div id="load-more-boards" className={styles.loadMoreContainer}>
        {hasMoreItems ? (
          <Provider theme={lightTheme} colorScheme={"light"}>
            <Button
              variant="cta"
              isQuiet
              onPress={loadMoreBoards}
              UNSAFE_className={styles.loadMoreButton}
            >
              Load more
            </Button>
          </Provider>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PrimeCommunityBoardsContainer;
