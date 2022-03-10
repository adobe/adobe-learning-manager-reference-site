import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PrimeBoard } from "../../models/PrimeModels";
import { loadBoard } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useBoard = (boardId: any) => {
  const { item } = useSelector((state: State) => state.social.board);
  const dispatch = useDispatch();

  const fetchBoard = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["filter.state"] = "ACTIVE";
      params["include"] = "createdBy,skills";
      const response = await RestAdapter.get({
        url: `${baseApiUrl}boards/${boardId}`, //${boardId}?`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        item: parsedResponse.board,
      };
      dispatch(loadBoard(data));
    } catch (e) {
      dispatch(loadBoard({} as PrimeBoard));
      console.log("Error while loading boards " + e);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return {
    item,
    fetchBoard,
  };
};
