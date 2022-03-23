import { useCallback } from "react";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const useComment = () => {
  const voteComment = useCallback(
    async (postId: any, action: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
        method: "POST",
      });
    },
    []
  );

  const deleteCommentVote = useCallback(
    async (postId: any, action: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
        method: "DELETE",
      });
    },
    []
  );

  return {
    voteComment,
    deleteCommentVote,
  };
};
