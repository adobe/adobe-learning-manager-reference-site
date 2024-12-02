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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { useEffect, useRef, useState } from "react";
import { getUserId } from "../../../utils/widgets/utils";
import { QueryParams, RestAdapter } from "../../../utils/restAdapter";
import { getALMConfig } from "../../../utils/global";
import { JsonApiParse } from "../../../utils/jsonAPIAdapter";

export function useSocialLearning() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showExploreBox, setShowExploreBox] = useState(false);
  const [emptyView, setEmptyView] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        await getPosts();
      } catch (e) {
        console.log(e);
      }
    };
    fetchPostData();
  }, []);

  async function getPosts() {
    const userId = await getUserId();
    if (!userId) {
      return;
    }
    const params: QueryParams = {};
    params["include"] = "createdBy";
    params["page[limit]"] = 3;
    params["excludePostBy"] = userId;
    params["filter.board.category"] = "allBoards";
    params["filter.state"] = "ACTIVE";
    try {
      const response = await RestAdapter.get({
        url: `${getALMConfig().primeApiURL}/posts`,
        params: params,
      });

      const postList = JsonApiParse(response).postList;
      setPosts(postList || []);

      if (!postList || postList.length == 0) {
        setEmptyView(true);
      } else if (postList.length <= 2) {
        setShowExploreBox(true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return {
    posts,
    showExploreBox,
    emptyView,
  };
}
