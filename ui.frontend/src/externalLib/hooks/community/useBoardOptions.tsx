import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addBoardToFavourites,
    removeBoardFromFavourites,
    deleteBoard
} from "../../store/actions/social/action";
import { RestAdapter } from "../../utils/restAdapter";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";

export const useBoardOptions = () => {
    const { item } = useSelector(
        (state: State) => state.social.board
    );
    const dispatch = useDispatch();
    const addBoardToFavourite = useCallback(async (boardId) => {
        const baseApiUrl =  getALMConfig().baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/favorite`,
            method:"POST"
        });
        dispatch(addBoardToFavourites({id:boardId}));
    }, [dispatch]);

    const removeBoardFromFavourite = useCallback(async (boardId) => {
        const baseApiUrl =  getALMConfig().baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/favorite`,
            method:"DELETE"
        });
        dispatch(removeBoardFromFavourites({id:boardId}));
    }, [dispatch]);

    const deleteBoardFromServer = useCallback(async (boardId, accountId) => {
        const baseApiUrl =  getALMConfig().baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/account/${accountId}/board/${boardId}`,
            method:"DELETE"
        });
        dispatch(deleteBoard({id:boardId}));
    }, [dispatch]);

    const reportBoard = useCallback(async (boardId) => {
        const baseApiUrl =  getALMConfig().baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/reportAbuse`,
            method:"POST"
        });
        // dispatch(removeBoardFromFavourites({id:boardId}));
    }, [dispatch]);

    return {
        item,
        addBoardToFavourite,
        removeBoardFromFavourite,
        deleteBoardFromServer,
        reportBoard
    };
};
