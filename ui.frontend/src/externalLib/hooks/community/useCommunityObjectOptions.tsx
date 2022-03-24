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
