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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObject, PrimeUser } from "../../models/PrimeModels";
import {
  loadTrainings,
  paginateTrainings,
  updateTrainingsAuthor,
} from "../../store/actions/author/action";
import { State } from "../../store/state";
import { getALMConfig } from "../../utils/global";
import { enrollTraining, getTraining } from "../../utils/lo-utils";

import { RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { GetTranslation } from "../../utils/translationService";
import { INTERNAL_STR, SORT_RECENTLY_PUBLISHED_PARAM } from "../../utils/constants";
import { Light } from "three";

export const useAuthor = (authorId: string, authorType: string) => {
  const [state, setState] = useState<{
    isLoading: boolean;
    errorCode: string;
  }>({ isLoading: false, errorCode: "" });
  const { isLoading, errorCode } = state;
  let { trainings, next } = useSelector((state: State) => state.authorTrainings);
  const [totalTrainings, setTotalTrainings] = useState(0);
  const [authorDetails, setAuthorDetails] = useState({} as PrimeUser);
  const baseApiUrl = getALMConfig().primeApiURL;
  const dispatch = useDispatch();
  const fetchTrainings = useCallback(
    async selectedKey => {
      try {
        setState({ isLoading: true, errorCode: "" });
        const response = await APIServiceInstance.getTrainingsForAuthor(
          authorId,
          authorType,
          selectedKey
        );
        dispatch(
          loadTrainings({
            trainings: response?.trainings || [],
            next: response?.next || "",
          })
        );
        const meta = response?.meta || {};
        setTotalTrainings((meta as any).count);
        setState({ isLoading: false, errorCode: "" });
      } catch (error: any) {
        dispatch(
          loadTrainings({
            trainings: [] as PrimeLearningObject[],
            next: "",
          })
        );
        setState({ isLoading: false, errorCode: error.status });
      }
    },
    [dispatch, authorId]
  );
  const getUserDetails = async (userId: string) => {
    try {
      const url = `${baseApiUrl}users/${userId}`;
      const response = await RestAdapter.ajax({
        url: url,
        method: "GET",
      });
      const parsedResponse = JsonApiParse(response);
      setAuthorDetails(parsedResponse.user);
    } catch (error) {
      throw new Error("Failed to get user details");
    }
  };
  useEffect(() => {
    if (authorType === INTERNAL_STR) {
      getUserDetails(authorId);
    }
    fetchTrainings(SORT_RECENTLY_PUBLISHED_PARAM);
  }, [fetchTrainings]);
  const updateLearningObject = useCallback(
    async (loId: string): Promise<PrimeLearningObject | Error> => {
      try {
        const response = await getTraining(loId);

        const list = [...trainings!];
        const index = list.findIndex(item => item.id === loId);
        list[index] = response!;

        const updatedTrainingList = [...list];
        dispatch(updateTrainingsAuthor({ trainings: updatedTrainingList }));

        return response!;
      } catch (error) {
        throw new Error();
      }
    },
    [trainings, dispatch]
  );
  const enrollmentHandler = useCallback(
    async (loId, loInstanceId, headers = {}): Promise<PrimeLearningObject | Error> => {
      try {
        await enrollTraining(loId, loInstanceId, headers);
        return updateLearningObject(loId);
      } catch (error: any) {
        throw new Error(GetTranslation("alm.enrollment.error"));
      }
    },
    [updateLearningObject]
  );
  const loadMoreTraining = useCallback(
    async (selectedKey = SORT_RECENTLY_PUBLISHED_PARAM) => {
      if (!next) return;
      try {
        const parsedResponse = await APIServiceInstance.getTrainingsForAuthor(
          authorId,
          authorType,
          selectedKey,
          next
        );
        dispatch(
          paginateTrainings({
            trainings: parsedResponse!.trainings || [],
            next: parsedResponse!.next || "",
          })
        );
      } catch (error: any) {
        setState({ isLoading: false, errorCode: error.status });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, next]
  );

  return {
    trainings,
    totalTrainings,
    loadMoreTraining,
    enrollmentHandler,
    updateLearningObject,
    isLoading,
    errorCode,
    hasMoreItems: Boolean(next),
    fetchTrainings,
    authorDetails,
  };
};
