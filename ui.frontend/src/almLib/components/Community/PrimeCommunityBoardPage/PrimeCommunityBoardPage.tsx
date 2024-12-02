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
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { useBoard } from "../../../hooks/community";
import styles from "./PrimeCommunityBoardPage.module.css";
import { PrimeCommunityPosts } from "../PrimeCommunityPosts";
import { PrimeCommunityMobileBackBanner } from "../PrimeCommunityMobileBackBanner";
import { PrimeCommunityMobileScrollToTop } from "../PrimeCommunityMobileScrollToTop";

import { useState } from "react";
import { getALMConfig, getPathParams } from "../../../utils/global";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
const BOARD_ID_STR = "boardId";

const PrimeCommunityBoardPage = () => {
  const [boardId] = useState(() => {
    let { communityBoardDetailsPath } = getALMConfig();
    let pathParams = getPathParams(communityBoardDetailsPath, [BOARD_ID_STR]);
    return pathParams[BOARD_ID_STR];
  });
  const { item } = useBoard(boardId);

  return (
    <ALMErrorBoundary>
      {/* Below 2 are seen only in mobile view */}
      <PrimeCommunityMobileBackBanner></PrimeCommunityMobileBackBanner>
      <PrimeCommunityMobileScrollToTop></PrimeCommunityMobileScrollToTop>

      <div className={styles.primeBoardParent}>
        {item && <PrimeCommunityBoard board={item} showBorder={false}></PrimeCommunityBoard>}
      </div>

      {item && <PrimeCommunityPosts board={item}></PrimeCommunityPosts>}
    </ALMErrorBoundary>
  );
};

export default PrimeCommunityBoardPage;
