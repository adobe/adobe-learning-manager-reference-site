import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { getALMConfig } from "../../utils/global";
// import APIServiceInstance from "../../common/APIService";
// import { State } from "../../store/state";
// import {
//     loadPost,
//   paginatePosts,
// } from "../../store/actions/social/action";
// import { PrimePost } from "../../models/PrimeModels";
// import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";

export const useComment = () => {
  const dispatch = useDispatch();
  const voteComment = useCallback(
    async (postId: any, action: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      //   const params: QueryParams = {};
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
        method: "POST",
      });
      //   const parsedResponse = JsonApiParse(response);
    },
    [dispatch]
  );

  const deleteCommentVote = useCallback(
    async (postId: any, action: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      //   const params: QueryParams = {};
      await RestAdapter.ajax({
        url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
        method: "DELETE",
      });
      //   const parsedResponse = JsonApiParse(response);
    },
    [dispatch]
  );

  return {
    voteComment,
    deleteCommentVote,
  };
};
