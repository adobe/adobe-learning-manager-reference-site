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
  PrimeUserRecommendationCriteria,
  PrimeUserRecommendationPreference,
} from "../../models/PrimeModels";
import {
  loadRecommendationLevels,
  loadRecommendationProducts,
  loadRecommendationRoles,
  loadUserRecommendationPreference,
} from "../../store/actions/user/action";
import { State } from "../../store/state";
import { getALMConfig, getALMUser } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";
import { RECOMMENDATION_PRODUCTS } from "../../utils/constants";

export const useRecommendations = () => {
  const { items, next, products, roles, levels } = useSelector(
    (state: State) => state.userRecommendationPreference
  );
  const dispatch = useDispatch();

  const getUserRecommendationPreferences = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const userResponse = await getALMUser();
      const response = await RestAdapter.get({
        url: `${baseApiUrl}/users/${userResponse?.user?.id}/recommendationPreferences`,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.userRecommendationPreferences || {},
        next: parsedResponse.links?.next || "",
      };
      dispatch(loadUserRecommendationPreference(data));
    } catch (e) {
      dispatch(
        loadUserRecommendationPreference({
          items: {} as PrimeUserRecommendationPreference,
          next: "",
        })
      );
      console.log("Error while loading user recommendation preferences " + e);
    }
  }, [dispatch]);

  const isProducts = (type: string) => {
    return type === RECOMMENDATION_PRODUCTS;
  };

  const getRecommendationsForType = useCallback(
    async (type: string) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const response = await RestAdapter.get({
          url: `${baseApiUrl}/${type}?filter.showAllRecommendationCriteria=true`,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          items:
            (isProducts(type)
              ? parsedResponse.recommendationProductList
              : parsedResponse.recommendationRoleList) || [],
          next: parsedResponse.links?.next || "",
        };
        dispatch(
          isProducts(type) ? loadRecommendationProducts(data) : loadRecommendationRoles(data)
        );
      } catch (e) {
        dispatch(
          isProducts(type)
            ? loadRecommendationProducts({
                items: [] as PrimeUserRecommendationCriteria[],
                next: "",
              })
            : loadRecommendationRoles({
                items: [] as PrimeUserRecommendationCriteria[],
                next: "",
              })
        );
        console.log("Error while loading recommendation criterias " + e);
      }
    },
    [dispatch]
  );

  const getRecommendationLevels = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const response = await RestAdapter.get({
        url: `${baseApiUrl}/data?filter.recommendationCriteria=level&filter.showAllRecommendationCriteria=true`,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.data || [],
        next: parsedResponse.links?.next || "",
      };
      dispatch(loadRecommendationLevels(data));
    } catch (e) {
      dispatch(
        loadRecommendationLevels({
          items: [],
          next: "",
        })
      );
      console.log("Error while loading criteria levels " + e);
    }
  }, [dispatch]);

  const saveUserRecommedations = async (data: any) => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const userResponse = await getALMUser();
      const headers = { "content-type": "application/json" };
      const request = {
        data,
      };
      const response: any = await RestAdapter.post({
        url: `${baseApiUrl}/users/${userResponse?.user?.id}/recommendationPreferences`,
        method: "POST",
        body: JSON.stringify(request),
        headers,
      });
      return response;
    } catch (error) {
      throw new Error("ERROR IN API");
    }
  };

  return {
    items,
    products,
    roles,
    levels,
    getUserRecommendationPreferences,
    getRecommendationsForType,
    getRecommendationLevels,
    saveUserRecommedations,
    hasMoreItems: Boolean(next),
  };
};
