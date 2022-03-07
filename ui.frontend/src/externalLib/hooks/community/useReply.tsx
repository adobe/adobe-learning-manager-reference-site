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

export const useReply = () => {
  const dispatch = useDispatch();

  const voteReply = useCallback(
    async (postId: any, action: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      //   const params: QueryParams = {};
      await RestAdapter.ajax({
        url: `${baseApiUrl}/replies/${postId}/vote?action=${action}`,
        method: "POST",
      });
      //   const parsedResponse = JsonApiParse(response);
    },
    [dispatch]
  );

  const deleteReplyVote = useCallback(
    async (postId: any, action: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      //   const params: QueryParams = {};
      await RestAdapter.ajax({
        url: `${baseApiUrl}/replies/${postId}/vote?action=${action}`,
        method: "DELETE",
      });
      //   const parsedResponse = JsonApiParse(response);
    },
    [dispatch]
  );

  return {
    voteReply,
    deleteReplyVote,
  };
};
