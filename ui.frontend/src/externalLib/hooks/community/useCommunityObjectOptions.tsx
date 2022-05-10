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
import { useDispatch } from "react-redux";
import {
  deleteComment,
  deletePost,
  deleteReply,
} from "../../store/actions/social/action";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const useCommunityObjectOptions = () => {
  const dispatch = useDispatch();

  const deletePostFromServer = useCallback(
    async (postId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/posts/${postId}`,
        method: "DELETE",
      });
      dispatch(deletePost({ id: postId }));
    },
    [dispatch]
  );

  const reportPostAbuse = useCallback(
    async (postId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const postBody = {
        data: {
          id: postId,
          type: "reportAbuse",
        },
      };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/posts/${postId}/reportAbuse`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  const deleteCommentFromServer = useCallback(
    async (commentId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${commentId}`,
        method: "DELETE",
      });
      dispatch(deleteComment({ id: commentId }));
    },
    [dispatch]
  );

  const reportCommentAbuse = useCallback(
    async (commentId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const postBody = {
        data: {
          id: commentId,
          type: "reportAbuse",
        },
      };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${commentId}/reportAbuse`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  const deleteReplyFromServer = useCallback(
    async (replyId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/replies/${replyId}`,
        method: "DELETE",
      });
      dispatch(deleteReply({ id: replyId }));
    },
    [dispatch]
  );

  const reportReplyAbuse = useCallback(
    async (replyId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const postBody = {
        data: {
          id: replyId,
          type: "reportAbuse",
        },
      };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/replies/${replyId}/reportAbuse`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  return {
    deletePostFromServer,
    reportPostAbuse,
    deleteCommentFromServer,
    reportCommentAbuse,
    deleteReplyFromServer,
    reportReplyAbuse,
  };
};
