import { useEffect, useState } from "react";
import {
  PrimeGamificationSettings,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeUser,
} from "../../models";
import { getALMConfig } from "../../utils/global";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { get } from "http";

export const useLeaderBoard = (
  training: PrimeLearningObject,
  trainingInstanceId: PrimeLearningObjectInstance
) => {
  const baseApiUrl = getALMConfig().primeApiURL;
  const headers = { "content-type": "application/json" };
  const [leaderBoardList, setLeaderBoardList] = useState([] as PrimeUser[]);
  const [currentUser, setCurrentUser] = useState({} as PrimeUser);
  const [isGamificationEnabled, setIsGamificationEnabled] = useState(false);
  const [gamificationRules, setGamificationRules] = useState([] as PrimeGamificationSettings[]);
  const instanceEndPoint = `${baseApiUrl}learningObjects/${training.id}/instances/${trainingInstanceId.id}`;
  const leaderBoardEndPoint = `${instanceEndPoint}/leaderboard`;
  const myRankEndPoint = `${leaderBoardEndPoint}/myRank`;
  const gamificationRulesEndPoint = `${instanceEndPoint}/gamificationSettings`;
  const LEARNER_LIMIT = 5;
  useEffect(() => {
    if (isGamificationEnabled) {
      fetchLeaderBoardResults();
      fetchLoRules();
      fetchCurrentUserRank();
    }
  }, [isGamificationEnabled]);

  useEffect(() => {
    const setGamificationEnabled = async () => {
      const parsedResponse = await getResponse(instanceEndPoint);
      setIsGamificationEnabled(parsedResponse.learningObjectInstance.gamificationEnabled);
    };
    setGamificationEnabled();
  }, []);

  const getResponse = async (url: string, queryParams?: QueryParams) => {
    const params: QueryParams = queryParams || {};
    const response = await RestAdapter.get({
      url: url,
      headers: headers,
      params: params,
    });
    return JsonApiParse(response);
  };

  const fetchCurrentUserRank = async () => {
    const parsedResponse = await getResponse(myRankEndPoint);
    setCurrentUser(parsedResponse.leaderBoardUser);
  };

  const fetchLeaderBoardResults = async () => {
    const params: QueryParams = {};
    params["page[limit]"] = LEARNER_LIMIT;
    const parsedResponse = await getResponse(leaderBoardEndPoint, params);
    setLeaderBoardList(parsedResponse.leaderBoardUserList);
  };

  const fetchLoRules = async () => {
    const parsedResponse = await getResponse(gamificationRulesEndPoint);
    setGamificationRules(parsedResponse.gamificationSettingsList);
  };
  return {
    leaderBoardList,
    fetchLeaderBoardResults,
    currentUser,
    fetchLoRules,
    gamificationRules,
    isGamificationEnabled,
  };
};
