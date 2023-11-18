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
import { COMMENT, POLL, POST } from "../../utils/constants";
import { addHttpsToHref, getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useDispatch } from "react-redux";
import { updatePost } from "../../store/actions/social/action";

export const usePost = () => {
  const dispatch = useDispatch();
  const addPost = useCallback(
    async (
      boardId: any,
      input: any,
      postingType: any,
      resource: any,
      isResourceModified: any,
      pollOptions: any
    ) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const updatedInput = addHttpsToHref(input);
      const postBody: any = {
        data: {
          type: POST,
          attributes: {
            postingType: postingType,
            resource: resource,
            state: "ACTIVE",
            text: updatedInput,
          },
        },
      };

      if (isResourceModified) {
        postBody.data.attributes.resource = resource;
      }

      if (postingType === POLL) {
        postBody.data.attributes.otherData = JSON.stringify(
          getPollPostObject(pollOptions)
        );
      }

      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/posts`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  const getPollPostObject = (pollOptions: any[]) => {
    let otherData = [] as any;
    let index = 1;
    pollOptions.map((value: any) => {
      if (value !== "") {
        let data = {
          id: index++,
          text: value,
          resourceId: null,
        };
        return otherData.push(data);
      }
      return null;
    });
    return otherData;
  };
  const patchPost = useCallback(
    async (
      postId: any,
      input: any,
      postingType: any,
      resource: any,
      isResourceModified: any,
      pollOptions
    ) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const updatedInput = addHttpsToHref(input);
      const postBody: any = {
        data: {
          type: POST,
          id: postId,
          attributes: {
            postingType: postingType,
            state: "ACTIVE",
            text: updatedInput,
          },
        },
      };

      if (isResourceModified) {
        postBody.data.attributes.resource = resource;
      }

      if (postingType === POLL) {
        postBody.data.attributes.otherData = JSON.stringify(
          getPollPostObject(pollOptions)
        );
      }

      const headers = { "content-type": "application/json" };
      const result = await RestAdapter.ajax({
        url: `${baseApiUrl}/posts/${postId}`,
        method: "PATCH",
        body: JSON.stringify(postBody),
        headers: headers,
      });
      const parsedResponse = JsonApiParse(result);
      const data = {
        item: parsedResponse.post,
      };
      dispatch(updatePost(data));
    },
    []
  );

  const addComment = useCallback(async (postId: any, input: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const updatedInput = addHttpsToHref(input);
    const postBody = {
      data: {
        type: COMMENT,
        attributes: {
          state: "ACTIVE",
          text: updatedInput,
        },
      },
    };
    const headers = { "content-type": "application/json" };
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/comments`,
      method: "POST",
      body: JSON.stringify(postBody),
      headers: headers,
    });
  }, []);

  const votePost = useCallback(async (postId: any, action: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
      method: "POST",
    });
  }, []);

  const deletePostVote = useCallback(async (postId: any, action: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
      method: "DELETE",
    });
  }, []);

  const submitPollVote = useCallback(async (postId: any, optionId: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/pollvote?optionId=${optionId}`,
      method: "POST",
    });
  }, []);

  return {
    addPost,
    patchPost,
    addComment,
    votePost,
    deletePostVote,
    submitPollVote,
  };
};
