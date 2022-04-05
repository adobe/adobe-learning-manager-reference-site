import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeSkill } from "../../models/PrimeModels";
import {
  loadSkills,
  paginateSkills,
} from "../../store/actions/user/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useSkills = () => {
  const { items, next } = useSelector(
    (state: State) => state.skill
  );
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

  // for pagination
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
    loadMoreSkills,
    hasMoreSkills: Boolean(next),
  };
};
