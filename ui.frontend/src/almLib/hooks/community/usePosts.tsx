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
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { loadPosts, paginatePosts } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { BOARD, POST, SKILL } from "../../utils/constants";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const usePosts = (boardId?: any) => {
  const DEFAULT_SORT_VALUE = "-dateCreated";
  const { items, next } = useSelector((state: State) => state.social.posts);
  const dispatch = useDispatch();

  //Fort any page load or filterchanges
  const fetchPosts = useCallback(
    async (boardId: any, sortFilter?: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
      params["filter.state"] = "ACTIVE";
      params["page[offset]"] = "0";
      params["page[limit]"] = "10";
      params["include"] = "parent,createdBy";
      const response = await RestAdapter.get({
        url: `${baseApiUrl}/boards/${boardId}/posts?`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.postList,
        next: parsedResponse.links?.next || "",
      };

      dispatch(loadPosts(data));
    },
    [dispatch]
  );

  const fetchBoardModerators = useCallback(async (boardId: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    let params: QueryParams = {};
    params["page[offset]"] = "0";
    params["page[limit]"] = "10";
    const response = await RestAdapter.get({
      url: `${baseApiUrl}/boards/${boardId}/moderators?`,
      params: params,
    });
    return JsonApiParse(response);
  }, []);

  const votePost = useCallback(async (postId: any, action: any) => {
    // try {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.get({
      url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
    });
  }, []);

  useEffect(() => {
    if (boardId) {
      fetchPosts(boardId);
    }
  }, [fetchPosts, boardId]);

  // for pagination
  const loadMorePosts = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginatePosts({
        items: parsedResponse!.postList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  const searchPostResult = useCallback(
    async (queryStr: any, object: any, type: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["query"] = queryStr;
      params["filter.state"] = "ACTIVE";
      params["page[limit]"] = "10";
      params["autoCompleteMode"] = "true";
      params["filter.socialTypes"] = POST;
      params["sort"] = "relevance";
      if (type === BOARD) {
        params["boardId"] = object;
      } else if (type === SKILL && object && object !== "") {
        params["filter.skills"] = object;
      }
      params["include"] = "model.createdBy";

      const response = await RestAdapter.get({
        url: `${baseApiUrl}/social/search`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.postList,
        next: parsedResponse.links?.next || "",
      };
      dispatch(loadPosts(data));
      return parsedResponse.postList;
    },
    [dispatch]
  );

  return {
    posts: items,
    fetchBoardModerators,
    loadMorePosts,
    fetchPosts,
    votePost,
    searchPostResult,
    hasMoreItems: Boolean(next),
  };
};
