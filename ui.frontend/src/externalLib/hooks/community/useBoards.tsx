import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeBoard } from "../../models/PrimeModels";
import { loadBoards, paginateBoards } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { useState } from "react";

const setSkillValues = () => {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints.boardsContainer;
    return (document.querySelector(cssSelector) as any)?.dataset.topics;
  }
};

const getSelectedSkill = (skillName: any, skills: any) => {
  skills = skills?.split(",");
  //if skill is not passed in query param or not in list, return first skill of list
  if (skillName === "" || skills?.indexOf(skillName) < 0) {
    if(skills) {
      skillName = skills[0];
    }
  }
  return skillName;
}

export const useBoards = (sortFilter: any, skillName: any) => {
  skillName = skillName ? skillName : "";
  const [skills] = useState(() => setSkillValues());
  const [currentSkill] = useState(() => getSelectedSkill(skillName, skills));
  const { items, next } = useSelector((state: State) => state.social.boards);
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchBoards = useCallback(
    async (sortFilter: any, skillName: any) => {
      try {
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["sort"] = sortFilter
        //To-do add for skill
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        if(skillName && skillName !== "")
          params["filter.board.skills"] = skillName;
        params["include"] = "createdBy,skills";
        const response = await RestAdapter.get({
          url: `${baseApiUrl}/boards?`,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        const data = {
          items: parsedResponse.boardList,
          next: parsedResponse.links?.next || "",
        };
        dispatch(loadBoards(data));
      } catch (e) {
        dispatch(loadBoards([] as PrimeBoard[]));
        console.log("Error while loading boards " + e);
      }
    },
    [dispatch]
  );

  // const fetchBoard = useCallback(async (boardId: any) => {
  //   try {
  //     const baseApiUrl =  (window as any).primeConfig.primeApiURL;
  //     const params: QueryParams = {};
  //     params["filter.state"]= "ACTIVE";
  //     params["include"] = "createdBy,skills";
  //     const response = await RestAdapter.get({
  //       url: `${baseApiUrl}/boards/10285`,//${boardId}?`,
  //       params: params,
  //     });
  //     const parsedResponse = JsonApiParse(response);
  //     const data = {
  //       item: parsedResponse.board,
  //     };

  //     dispatch(loadBoard(data));
  //   } catch (e) {
  //     dispatch(loadBoard({} as PrimeBoard));
  //     console.log("Error while loading boards " + e);
  //   }
  // }, [dispatch]);

  useEffect(() => {
    fetchBoards(sortFilter, currentSkill);
  }, [fetchBoards, sortFilter, currentSkill]);

  // for pagination
  const loadMoreBoards = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateBoards({
        items: parsedResponse!.boardList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    // item,
    items,
    loadMoreBoards,
    fetchBoards,
    skills,
    currentSkill,
    hasMoreItems: Boolean(next),
  };
};
