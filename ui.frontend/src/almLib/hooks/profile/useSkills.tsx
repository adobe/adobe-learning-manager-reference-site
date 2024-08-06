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
import APIServiceInstance from "../../common/APIService";
import { PrimeSkill } from "../../models/PrimeModels";
import { loadSkills, paginateSkills } from "../../store/actions/user/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useSkills = () => {
  const { items, next } = useSelector((state: State) => state.skill);
  const dispatch = useDispatch();

  const fetchSkills = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["sort"] = "name";
      params["page[offset]"] = "0";
      params["page[limit]"] = "10";
      params["filter.excludeSkillInterest"] = true;

      const response = await RestAdapter.get({
        url: `${baseApiUrl}/skills?`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.skillList,
        next: parsedResponse.links?.next || "",
      };
      dispatch(loadSkills(data));
    } catch (e) {
      dispatch(loadSkills([] as PrimeSkill[]));
      console.log("Error while loading skills " + e);
    }
  }, [dispatch]);

  const searchSkill = useCallback(
    async (q: string) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["filter.loTypes"] = "skill";
        params["state"] = "active";
        params["sort"] = "name";
        params["type"] = "skill";
        params["filter.skill.type"] = "internal";
        params["query"] = q;
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";

        const response = await RestAdapter.get({
          url: `${baseApiUrl}/search?`,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          items: parsedResponse.skillList || [],
          next: parsedResponse.links?.next || "",
        };
        dispatch(loadSkills(data));
      } catch (e) {
        dispatch(loadSkills([] as PrimeSkill[]));
        console.log("Error while loading skills " + e);
      }
    },
    [dispatch]
  );

  const loadMoreSkills = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateSkills({
        items: parsedResponse!.skillList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    skills: items,
    fetchSkills,
    searchSkill,
    loadMoreSkills,
    hasMoreSkills: Boolean(next),
  };
};
