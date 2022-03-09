import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeBoard } from "../../models/PrimeModels";
import { loadBoards, paginateBoards } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useBoards = (sortFilter: any, skillName: any) => {
  const { items, next } = useSelector((state: State) => state.social.boards);
  const dispatch = useDispatch();

  //Fort any page load or filterchanges
  const fetchBoards = useCallback(
    async (sortFilter: any, skillName: any) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["sort"] = sortFilter
        //To-do add for skill
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        params["filter.board.skill"] = skillName;
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
    },
    [dispatch]
  );

  // const fetchBoard = useCallback(async (boardId: any) => {
  //   try {
  //     const baseApiUrl =  (window as any).primeConfig.primeApiURL;
  //     const params: QueryParams = {};
  //     params["filter.state"]= "ACTIVE";
  //     params["include"] = "createdBy,skills";
  //     const response = await RestAdapter.get({
  //       url: `${baseApiUrl}/boards/10285`,//${boardId}?`,
  //       params: params,
  //     });
  //     const parsedResponse = JsonApiParse(response);
  //     const data = {
  //       item: parsedResponse.board,
  //     };

  //     dispatch(loadBoard(data));
  //   } catch (e) {
  //     dispatch(loadBoard({} as PrimeBoard));
  //     console.log("Error while loading boards " + e);
  //   }
  // }, [dispatch]);

  useEffect(() => {
    fetchBoards(sortFilter, skillName);
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
    // item,
    items,
    loadMoreBoard,
    fetchBoards,
    // fetchBoard
  };
};
