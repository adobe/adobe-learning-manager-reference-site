import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeUserSkillInterest } from "../../models/PrimeModels";
import {
  loadUserSkillInterest,
  paginateUserSkillInterest,
  deleteUserSkillInterest
} from "../../store/actions/user/action";
import { State } from "../../store/state";
import { getALMConfig, getALMUser } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useUserSkillInterest = () => {
  const { items, next } = useSelector(
    (state: State) => state.userSkillInterest
  );
  const dispatch = useDispatch();
  const fetchUserSkillInterest = useCallback(async () => {
    try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const params: QueryParams = {};
      params["filter.skillInterestTypes"] = "ADMIN_DEFINED"; //internal skills only
      params["page[offset]"] = "0";
      params["page[limit]"] = "10";
      params["include"] = "skill,userSkills.skillLevel";

      const userResponse = await getALMUser();
      const response = await RestAdapter.get({
        url: `${baseApiUrl}/users/${userResponse.user.id}/skillInterests?`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const data = {
        items: parsedResponse.userSkillInterestList,
        next: parsedResponse.links?.next || "",
      };
      dispatch(loadUserSkillInterest(data));
    } catch (e) {
      dispatch(loadUserSkillInterest([] as PrimeUserSkillInterest[]));
      console.log("Error while loading boards " + e);
    }
  }, [dispatch]);

  const saveUserSkillInterest = useCallback(
    async (
      skills
    ) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const userResponse = await getALMUser();
      await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userResponse.user.id}/userSkillInterest?`,
        method: "POST",
        body: JSON.stringify(skills),
        headers: headers,
      });
    },
    []
  );

  const removeUserSkillInterest = useCallback(
    async (
      skillId
    ) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };
      const userResponse = await getALMUser();
      await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userResponse.user.id}/userSkillInterest/${skillId}?`,
        method: "DELETE",
        headers: headers,
      });
      dispatch(deleteUserSkillInterest({"skillId": skillId}));
    },
    [dispatch]
  );

  // for pagination
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
    fetchUserSkillInterest();
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
