import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { State } from "../../store/state";
import {
    loadReplies,
    paginateReplies,
} from "../../store/actions/social/action";
import { PrimeReply } from "../../models/PrimeModels";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { getALMConfig } from  "../../utils/global";


export const useReplies = (commentId:  any) => {
  const { items, next } = useSelector(
    (state: State) => state.social.replies
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchReplies = useCallback(async (commentId: any) => {
    try {
        const baseApiUrl = getALMConfig().baseApiUrl;
        const params: QueryParams = {};
        //To-do add for skill
        params["sort"] = "-dateCreated"
        params["filter.state"]= "ACTIVE";
        params["page[offset]"]= "0";
        params["page[limit]"]= "10";
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
  }, [dispatch]);

  const addReply = useCallback(async (commentId: any, input: any) => {
    // try {
      const baseApiUrl = getALMConfig().baseApiUrl;
      const postBody = {
        data: {
          type: "reply", 
          attributes: {
            state: "ACTIVE", 
            text: input
          }
        }
      }
      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
          url: `${baseApiUrl}/comments/${commentId}/replies`,
          method:"POST",
          body: JSON.stringify(postBody),
          headers: headers
      });
    //   const parsedResponse = JsonApiParse(response);
  }, [dispatch]);
  
  // useEffect(() => {
  //   fetchReplies(commentId);
  // }, [fetchReplies]);

  // for pagination
  const loadMoreReplies = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateReplies({
        replies: parsedResponse!.replyList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    items,
    fetchReplies,
    loadMoreReplies,
    addReply
  };
};
