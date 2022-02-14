import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
    addBoardToFavourites,
    removeBoardFromFavourites,
    deleteBoard
} from "../../store/actions/social/action";
import { RestAdapter } from "../../utils/restAdapter";

export const useBoardOptions = () => {
    const dispatch = useDispatch();
    const addBoardToFavourite = useCallback(async (boardId) => {
        const baseApiUrl =  (window as any).primeConfig.baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/favorite`,
            method:"POST"
        });
        dispatch(addBoardToFavourites({id:boardId}));
    }, [dispatch]);

    const removeBoardFromFavourite = useCallback(async (boardId) => {
        const baseApiUrl =  (window as any).primeConfig.baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/favorite`,
            method:"DELETE"
        });
        dispatch(removeBoardFromFavourites({id:boardId}));
    }, [dispatch]);

    const deleteBoardFromServer = useCallback(async (boardId, accountId) => {
        const baseApiUrl =  (window as any).primeConfig.socialBaseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/account/${accountId}/board/${boardId}`,
            method:"DELETE"
        });
        dispatch(deleteBoard({id:boardId}));
    }, [dispatch]);

    const reportBoard = useCallback(async (boardId) => {
        const baseApiUrl =  (window as any).primeConfig.baseApiUrl;
        await RestAdapter.ajax({
            url: `${baseApiUrl}/boards/${boardId}/reportAbuse`,
            method:"POST"
        });
        // dispatch(removeBoardFromFavourites({id:boardId}));
    }, [dispatch]);

    return {
        addBoardToFavourite,
        removeBoardFromFavourite,
        deleteBoardFromServer,
        reportBoard
    };
};
