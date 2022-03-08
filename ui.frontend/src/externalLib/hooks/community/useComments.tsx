import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeComment } from "../../models/PrimeModels";
import {
  loadComments,
  paginateComments,
  updateComment
} from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useComments = () => {
  const { items, next } = useSelector((state: State) => state.social.comments);
  const dispatch = useDispatch();

  //Fort any page load or filterchanges
  const fetchComments = useCallback(
    async (postId?: any) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        // params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
        //To-do add for skill
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
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
        dispatch(loadComments(data));
      } catch (e) {
        dispatch(loadComments([] as PrimeComment[]));
        console.log("Error while loading boards " + e);
      }
    },
    [dispatch]
  );

  // useEffect(() => {
  //   fetchComments(postId);
  // }, [fetchComments]);

  const patchComment = useCallback(async (commentId: any, input: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const body = {
      data: {
        type: "comment",
        id: commentId,
        attributes: {
          state: "ACTIVE",
          text: input,
        },
      },
    };
    const headers = { "content-type": "application/json" };
    const result = await RestAdapter.ajax({
      url: `${baseApiUrl}/comments/${commentId}`,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: headers,
    });

    const parsedResponse = JsonApiParse(result);
    const data = {
      item: parsedResponse.comment,
    };
    dispatch(updateComment(data));
  },[dispatch]);

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
    patchComment,
    fetchComments,
    loadMoreComments,
    // fetchBoard
  };
};
