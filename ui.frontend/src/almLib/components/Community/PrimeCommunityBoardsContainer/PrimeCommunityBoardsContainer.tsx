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
