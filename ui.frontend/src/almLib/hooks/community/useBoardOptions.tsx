/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
    async boardId => {
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
    async boardId => {
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

  const reportBoard = useCallback(async boardId => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/boards/${boardId}/reportAbuse`,
      method: "POST",
    });
  }, []);

  return {
    item,
    addBoardToFavourite,
    removeBoardFromFavourite,
    deleteBoardFromServer,
    reportBoard,
  };
};
