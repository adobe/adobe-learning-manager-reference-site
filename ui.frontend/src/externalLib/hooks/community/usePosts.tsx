import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimePost } from "../../models/PrimeModels";
import { loadPosts, paginatePosts } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const usePosts = (boardId?: any) => {
  const DEFAULT_SORT_VALUE = "-dateCreated";
  const { items, next } = useSelector((state: State) => state.social.posts);
  const dispatch = useDispatch();

  //Fort any page load or filterchanges
  const fetchPosts = useCallback(
    async (boardId: any, sortFilter?: any) => {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
        //To-do add for skill
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
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
    },
    [dispatch]
  );

  const votePost = useCallback(
    async (postId: any, action: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
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
    },
    [dispatch]
  );

  useEffect(() => {
    if(boardId) {
      fetchPosts(boardId);
    }
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

  const searchPostResult = useCallback(async (queryStr: any, object: any, type: any) => {
      const baseApiUrl =  getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["query"] = queryStr;
      params["filter.state"]= "ACTIVE";
      params["page[limit]"]= "10";
      params["autoCompleteMode"]= "true";
      params["filter.socialTypes"]= "post";
      params["sort"]= "relevance";
      console.log(type);
      console.log(object);
      if (type === "board") {
        params["boardId"] = object;
      } else if (type === "skill" && object && object !== "") {
        params["filter.skills"] = object;
      }
      params["include"] = "model";

      const response = await RestAdapter.get({
          url: `${baseApiUrl}/social/search`,
          params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
          items: parsedResponse.postList,
          next: parsedResponse.links?.next || "",
      };
      dispatch(loadPosts(data));
      return parsedResponse.postList;
  }, [dispatch]);

  return {
    // item,
    posts:items,
    loadMorePost,
    fetchPosts,
    votePost,
    searchPostResult
    // fetchBoard
  };
};
