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
import { PrimeReply } from "../../models/PrimeModels";
import { loadReplies, paginateReplies, updateReply } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { REPLY } from "../../utils/constants";
import { addHttpsToHref, getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useReplies = (commentId: any) => {
  const { items, next } = useSelector((state: State) => state.social.replies);
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchReplies = useCallback(
    async (commentId: any) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        //To-do add for skill
        params["sort"] = "-dateCreated";
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        params["include"] = "createdBy";
        const response = await RestAdapter.get({
          url: `${baseApiUrl}/comments/${commentId}/replies?`,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          selectedCommentId: commentId,
          items: parsedResponse.replyList,
          next: parsedResponse.links?.next || "",
        };

        dispatch(loadReplies(data));
      } catch (e) {
        dispatch(loadReplies([] as PrimeReply[]));
        console.log("Error while loading boards " + e);
      }
    },
    [dispatch]
  );

  const patchReply = useCallback(
    async (replyId: any, input: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const updatedInput = addHttpsToHref(input);
      const body = {
        data: {
          type: REPLY,
          id: replyId,
          attributes: {
            state: "ACTIVE",
            text: updatedInput,
          },
        },
      };
      const headers = { "content-type": "application/json" };
      const result = await RestAdapter.ajax({
        url: `${baseApiUrl}/replies/${replyId}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: headers,
      });

      const parsedResponse = JsonApiParse(result);
      const data = {
        item: parsedResponse.reply,
      };
      dispatch(updateReply(data));
    },
    [dispatch]
  );

  const addReply = useCallback(async (commentId: any, input: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const updatedInput = addHttpsToHref(input);
    const postBody = {
      data: {
        type: REPLY,
        attributes: {
          state: "ACTIVE",
          text: updatedInput,
        },
      },
    };
    const headers = { "content-type": "application/json" };
    await RestAdapter.ajax({
      url: `${baseApiUrl}/comments/${commentId}/replies`,
      method: "POST",
      body: JSON.stringify(postBody),
      headers: headers,
    });
  }, []);

  // for pagination
  const loadMoreReplies = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateReplies({
        items: parsedResponse!.replyList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    items,
    fetchReplies,
    addReply,
    patchReply,
    loadMoreReplies,
    hasMoreItems: Boolean(next),
  };
};
