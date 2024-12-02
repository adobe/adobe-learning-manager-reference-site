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
import { useCallback, useState } from "react";
import { getALMConfig, getALMUser } from "../../utils/global";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useDispatch, useSelector } from "react-redux";

import { State } from "../../store";
import { loadFavouriteBoards } from "../../store/actions/social";

export const useSocial = () => {
  const { userFavBoards } = useSelector((state: State) => state.social);
  const [isLoading, setIsLoading] = useState(false);

  const config = getALMConfig();
  const dispatch = useDispatch();

  const fetchFollowers = useCallback(async () => {
    try {
      console.log("-------- followers api called-------");
      const user = await getALMUser();
      const params: QueryParams = {};
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/socialProfiles/${user?.user.id}/followers`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);

      return parsedResponse;
    } catch (e) {
      console.log(e);
    }
  }, [config.primeApiURL]);

  const fetchFavouriteBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("-------- Favourite Boards api called-------");
      const params: QueryParams = {};
      params["filter.boardType"] = "FavoriteBoards";

      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/boards`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response).boardList || [];

      dispatch(loadFavouriteBoards(parsedResponse));

      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  }, [dispatch, config.primeApiURL]);

  return { userFavBoards, isLoading, setIsLoading, fetchFollowers, fetchFavouriteBoards };
};
