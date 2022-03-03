import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { State } from "../../store/state";
import {
    loadComments,
    loadCommentsForPost,
    paginateComments,
} from "../../store/actions/social/action";
import { PrimeComment } from "../../models/PrimeModels";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { getALMConfig } from  "../../utils/global";

export const useComments = (postId:  any) => {
  const { items, next } = useSelector(
    (state: State) => state.social.comments
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchComments = useCallback(async (postId: any) => {
    try {
        const baseApiUrl =  getALMConfig().baseApiUrl;
        const params: QueryParams = {};
        // params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
        //To-do add for skill
        params["filter.state"]= "ACTIVE";
        params["page[offset]"]= "0";
        params["page[limit]"]= "10";
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

        const postData = {
          selectedPostId: postId,
        };

        dispatch(loadComments(data));
        dispatch(loadCommentsForPost(postData));
    } catch (e) {
        dispatch(loadComments([] as PrimeComment[]));
        console.log("Error while loading boards " + e);
    }
  }, [dispatch]);
  
  // useEffect(() => {
  //   fetchComments(postId);
  // }, [fetchComments]);

  // for pagination
  const loadMoreComments = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateComments({
        comments: parsedResponse!.commentList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    // item,
    items,
    fetchComments,
    loadMoreComments,
    // fetchBoard
  };
};
