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
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeUserSkillInterest } from "../../models/PrimeModels";
import {
  deleteUserSkillInterest,
  loadUserSkillInterest,
  paginateUserSkillInterest,
} from "../../store/actions/user/action";
import { State } from "../../store/state";
import { getALMConfig, getALMUser } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { INTERNAL } from "../../utils/constants";

export const useUserSkillInterest = () => {
  const { items, next } = useSelector((state: State) => state.userSkillInterest);
  const dispatch = useDispatch();
  const fetchUserSkillInterest = useCallback(
    async (type: string) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        // params["filter.skillInterestTypes"] = type;
        params["type"] = type;
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        params["include"] = "skill,userSkills.skillLevel";
        // params["filter.skillInterestTypes"]=INDUSTRY_ALIGNED
        const userResponse = await getALMUser();
        const response = await RestAdapter.get({
          url: `${baseApiUrl}/users/${userResponse?.user?.id}/userSkillInterest?`,
          // url: `${baseApiUrl}/users/${userResponse?.user?.id}/skillInterests?`,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          items: parsedResponse.userSkillInterestList || [],
          next: parsedResponse.links?.next || "",
        };
        dispatch(loadUserSkillInterest(data));
      } catch (e) {
        dispatch(loadUserSkillInterest([] as PrimeUserSkillInterest[]));
        console.log("Error while loading user skill interests " + e);
      }
    },
    [dispatch]
  );

  const saveUserSkillInterest = useCallback(async skills => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const headers = { "content-type": "application/json" };
    const userResponse = await getALMUser();
    await RestAdapter.ajax({
      url: `${baseApiUrl}/users/${userResponse?.user?.id}/userSkillInterest?`,
      method: "POST",
      body: JSON.stringify(skills),
      headers: headers,
    });
  }, []);

  const removeUserSkillInterest = useCallback(
    async skillId => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const userResponse = await getALMUser();
      await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userResponse?.user?.id}/userSkillInterest/${skillId}?`,
        method: "DELETE",
        headers: headers,
      });
      dispatch(deleteUserSkillInterest({ skillId: skillId }));
    },
    [dispatch]
  );

  const loadMoreUserSkillInterest = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateUserSkillInterest({
        items: parsedResponse!.userSkillInterestList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  useEffect(() => {
    fetchUserSkillInterest(INTERNAL);
  }, [dispatch]);

  return {
    items,
    fetchUserSkillInterest,
    loadMoreUserSkillInterest,
    saveUserSkillInterest,
    removeUserSkillInterest,
    hasMoreItems: Boolean(next),
  };
};
