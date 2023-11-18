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
import { PrimeBoard } from "../../models/PrimeModels";
import { loadBoards, paginateBoards } from "../../store/actions/social/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { useState } from "react";
import { MYBOARDS } from "../../utils/constants";

const setSkillValues = () => {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints.boardsContainer;
    return (document.querySelector(cssSelector) as any)?.dataset.products;
  }
};

const getSelectedSkill = (skillName: string, skills: string) => {
  let skillList = skills?.split(",");
  //if skill is not passed in query param or not in list, return first skill of list
  if (skillName === "" || skillList?.indexOf(skillName) < 0) {
    if (skills) {
      skillName = skillList[0];
    }
  }
  return skillName;
};

export const useBoards = (sortFilter: string, skillName: string) => {
  skillName = skillName ? skillName : "";
  const [skills] = useState(() => setSkillValues());
  const [isBoardsLoading,setBoardsLoading] = useState(false);
  const [currentSkill] = useState(() => getSelectedSkill(skillName, skills));
  const { items, next } = useSelector((state: State) => state.social.boards);
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchBoards = useCallback(
    async (sortFilter: any, skillName: any , myBoards: boolean= false) => {
      try {
        setBoardsLoading(true);
        const baseApiUrl = getALMConfig().primeApiURL;
        const params: QueryParams = {};
        params["sort"] = sortFilter;
        params["filter.state"] = "ACTIVE";
        params["page[offset]"] = "0";
        params["page[limit]"] = "10";
        if (skillName && skillName !== "")
          params["filter.board.skills"] = skillName;
        params["include"] = "createdBy,skills";
        if(myBoards){
          params["filter.boardType"] = MYBOARDS ;
        }
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
        setBoardsLoading(false)
      } catch (e) {
        dispatch(loadBoards([] as PrimeBoard[]));
        console.log("Error while loading boards " + e);
      }
    },
    [dispatch]
  );

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
    items,
    loadMoreBoards,
    fetchBoards,
    skills,
    isBoardsLoading,
    currentSkill,
    hasMoreItems: Boolean(next),
  };
};
