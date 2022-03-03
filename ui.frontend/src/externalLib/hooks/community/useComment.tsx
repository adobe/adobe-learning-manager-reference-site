import { useCallback } from "react";
import { useDispatch } from "react-redux";
// import APIServiceInstance from "../../common/APIService";
// import { State } from "../../store/state";
// import {
//     loadPost,
//   paginatePosts,
// } from "../../store/actions/social/action";
// import { PrimePost } from "../../models/PrimeModels";
// import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";
import { getALMConfig } from  "../../utils/global";

export const useComment = () => {
  const dispatch = useDispatch();
  const voteComment = useCallback(async (postId: any, action: any) => {
    // try {
      const baseApiUrl =  getALMConfig().baseApiUrl;
    //   const params: QueryParams = {};
      await RestAdapter.ajax({
          url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
          method:"POST"
      });
    //   const parsedResponse = JsonApiParse(response);
  }, [dispatch]);

  const deleteCommentVote = useCallback(async (postId: any, action: any) => {
    // try {
      const baseApiUrl =  getALMConfig().baseApiUrl;
    //   const params: QueryParams = {};
      await RestAdapter.ajax({
          url: `${baseApiUrl}/comments/${postId}/vote?action=${action}`,
          method:"DELETE"
      });
    //   const parsedResponse = JsonApiParse(response);
  }, [dispatch]);

  return {
    voteComment,
    deleteCommentVote
  };
};
