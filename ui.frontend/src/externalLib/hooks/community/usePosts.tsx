import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { State } from "../../store/state";
import {
  loadPosts,
  paginatePosts,
} from "../../store/actions/social/action";
import { PrimePost } from "../../models/PrimeModels";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { getALMConfig } from  "../../utils/global";

export const usePosts = (boardId:  any) => {
  const DEFAULT_SORT_VALUE = "-dateCreated";
  const { items, next } = useSelector(
    (state: State) => state.social.posts
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchPosts = useCallback(async (boardId: any, sortFilter?: any) => {
    try {
        const baseApiUrl = getALMConfig().baseApiUrl;
        const params: QueryParams = {};
        params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
        //To-do add for skill
        params["filter.state"]= "ACTIVE";
        params["page[offset]"]= "0";
        params["page[limit]"]= "10";
        params["include"] = "parent,createdBy";
        const response = await RestAdapter.get({
            url: `${baseApiUrl}/boards/${boardId}/posts?`,
            params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
            items: parsedResponse.postList,
            next: parsedResponse.links?.next || "",
        };

        dispatch(loadPosts(data));
    } catch (e) {
        dispatch(loadPosts([] as PrimePost[]));
        console.log("Error while loading boards " + e);
    }
  }, [dispatch]);

  const votePost = useCallback(async (postId: any, action: any) => {
    // try {
      const baseApiUrl =  getALMConfig().baseApiUrl;
      await RestAdapter.get({
          url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
      });
      // const parsedResponse = JsonApiParse(response);
      // const data = {
      //     items: parsedResponse.postList,
      //     next: parsedResponse.links?.next || "",
      // };

      // dispatch(loadPosts(data));
  // } catch (e) {
  //     dispatch(loadPosts([] as PrimePost[]));
  //     console.log("Error while loading boards " + e);
  // }
  }, [dispatch]);
  
  useEffect(() => {
    fetchPosts(boardId);
  }, [fetchPosts]);

  // for pagination
  const loadMorePost = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginatePosts({
        posts: parsedResponse!.postList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    // item,
    items,
    loadMorePost,
    fetchPosts,
    votePost,
    // fetchBoard
  };
};
