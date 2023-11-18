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
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeComment } from "../../models/PrimeModels";
import {
  loadComments,
  paginateComments,
  updateComment,
} from "../../store/actions/social/action";
import { State } from "../../store/state";
import { COMMENT } from "../../utils/constants";
import { addHttpsToHref, getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useComments = () => {
  const { items, next } = useSelector((state: State) => state.social.comments);
  const dispatch = useDispatch();

  //Fort any page load or filterchanges
  const fetchComments = useCallback(
    async (postId?: any) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        params["include"] = "createdBy";
        const response = await RestAdapter.get({
          url: `${baseApiUrl}/posts/${postId}/comments?`,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          selectedPostId: postId,
          items: parsedResponse.commentList,
          next: parsedResponse.links?.next || "",
        };
        dispatch(loadComments(data));
      } catch (e) {
        dispatch(loadComments([] as PrimeComment[]));
        console.log("Error while loading boards " + e);
      }
    },
    [dispatch]
  );

  const patchComment = useCallback(
    async (commentId: any, input: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const updatedInput = addHttpsToHref(input);
      const body = {
        data: {
          type: COMMENT,
          id: commentId,
          attributes: {
            state: "ACTIVE",
            text: updatedInput,
          },
        },
      };
      const headers = { "content-type": "application/json" };
      const result = await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${commentId}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: headers,
      });

      const parsedResponse = JsonApiParse(result);
      const data = {
        item: parsedResponse.comment,
      };
      dispatch(updateComment(data));
    },
    [dispatch]
  );

  const markCommentAsRightAnswer = useCallback(
    async (commentId: any, value: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const body = {
        data: {
          type: COMMENT,
          id: commentId,
          attributes: {
            state: "ACTIVE",
            isCorrectAnswer: value,
          },
        },
      };
      const headers = { "content-type": "application/json" };
      const result = await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${commentId}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: headers,
      });

      const parsedResponse = JsonApiParse(result);
      const data = {
        item: parsedResponse.comment,
      };
      dispatch(updateComment(data));
    },
    [dispatch]
  );

  const loadMoreComments = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateComments({
        items: parsedResponse!.commentList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    items,
    patchComment,
    markCommentAsRightAnswer,
    fetchComments,
    loadMoreComments,
    hasMoreItems: Boolean(next),
  };
};
