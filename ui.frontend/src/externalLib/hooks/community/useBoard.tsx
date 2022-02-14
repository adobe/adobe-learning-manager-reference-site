import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { State } from "../../store/state";
import {
  loadBoards,
  paginateBoards,
} from "../../store/actions/social/action";
import { PrimeBoard } from "../../models/PrimeModels";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";


export const useBoard = () => {
  const DEFAULT_SORT_VALUE = "dateUpdated";
  const { items, next } = useSelector(
    (state: State) => state.social.boards
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchBoards = useCallback(async (sortFilter: any, skill: any) => {
    try {
      const baseApiUrl =  (window as any).primeConfig.baseApiUrl;
      const params: QueryParams = {};
      params["sort"] = sortFilter ? sortFilter : DEFAULT_SORT_VALUE;
      //To-do add for skill
      params["filter.state"]= "ACTIVE";
      params["page[offset]"]= "0";
      params["page[limit]"]= "10";

      params["include"] = "createdBy,skills";
      const response = await RestAdapter.get({
        url: `${baseApiUrl}/boards?`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.boardList,
        next: parsedResponse.links?.next || "",
      };

      dispatch(loadBoards(data));
    } catch (e) {
      dispatch(loadBoards([] as PrimeBoard[]));
      console.log("Error while loading boards " + e);
    }
  }, [dispatch]);

  
  useEffect(() => {
    fetchBoards(DEFAULT_SORT_VALUE, null);
  }, [fetchBoards]);

  // for pagination
  const loadMoreBoard = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateBoards({
        boards: parsedResponse!.boardList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    items,
    loadMoreBoard,
    fetchBoards
  };
};
