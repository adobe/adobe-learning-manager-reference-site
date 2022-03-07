import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addBoardToFavourites,
  deleteBoard,
  removeBoardFromFavourites,
} from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const useBoardOptions = () => {
  const { item } = useSelector((state: State) => state.social.board);
  const dispatch = useDispatch();
  const addBoardToFavourite = useCallback(
    async (boardId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/favorite`,
        method: "POST",
      });
      dispatch(addBoardToFavourites({ id: boardId }));
    },
    [dispatch]
  );

  const removeBoardFromFavourite = useCallback(
    async (boardId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/favorite`,
        method: "DELETE",
      });
      dispatch(removeBoardFromFavourites({ id: boardId }));
    },
    [dispatch]
  );

  const deleteBoardFromServer = useCallback(
    async (boardId, accountId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/account/${accountId}/board/${boardId}`,
        method: "DELETE",
      });
      dispatch(deleteBoard({ id: boardId }));
    },
    [dispatch]
  );

  const reportBoard = useCallback(
    async (boardId) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/reportAbuse`,
        method: "POST",
      });
      // dispatch(removeBoardFromFavourites({id:boardId}));
    },
    [dispatch]
  );

  return {
    item,
    addBoardToFavourite,
    removeBoardFromFavourite,
    deleteBoardFromServer,
    reportBoard,
  };
};
