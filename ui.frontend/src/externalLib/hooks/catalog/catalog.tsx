import { useCallback } from "react";
import { RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useDispatch, useSelector } from "react-redux";
import {} from "react-redux";
import { State } from "../../store/state";

export type QueryParams = Record<string, string | number | boolean>;

export const useCatalog = () => {
  const { items, filterState, sort } = useSelector(
    (state: State) => state.catalog
  );
  const dispatch = useDispatch();

  const fetchTrainings = useCallback(async () => {
    try {
      console.log("filterState : ", filterState);

      const params: QueryParams = {};
      params["sort"] = sort;
      params["filter.loTypes"] = filterState.loTypes;

      if (filterState.skillName) {
        params["filter.skillName"] = filterState.skillName;
      }
      if (filterState.tagName) {
        params["filter.tags"] = filterState.tagName;
      }
      if (filterState.learnerState) {
        params["filter.learnerState"] = filterState.learnerState;
      }
      if (filterState.loFormat) {
        params["filter.loFormat"] = filterState.loFormat;
      }
      if (filterState.duration) {
        params["filter.duration.range"] = filterState.duration;
      }

      const response = await RestAdapter.get({
        url: `https://captivateprimestage1.adobe.com/primeapi/v2/learningObjects?page[limit]=10`,
        params: params,
      });
      const itemsData = JsonApiParse(response).learningObjectList;
      
      dispatch({
        type: "FETCH_TRAININGS",
        payload: itemsData,
      });
    } catch (e) {
      //   console.log("Error while calling user " + e);
      //   initAccountUser({ account: { name: "error" }, userData: {} });
    }
  }, [dispatch, filterState, sort]);

  return {
    items,
    filterState,
    sort,
    fetchTrainings,
  };
};

//   const initUser = useCallback(async () => {
//     try {
//       const params = {
//         include: "account",
//       };
//       const response = await RestAdapter.get({
//         url: `https://captivateprimeqe.adobe.com/primeapi/v2/user`,
//         params: params,
//       });
//       const userData = JsonApiParse(response).user;
//       const account = userData.account;
//       initAccountUser({ userData, account });
//       dispatch({
//         type: "AUTHENTICATE_USER",
//         payload: "ABCD",
//       });
//     } catch (e) {
//       console.log("Error while calling user " + e);
//       initAccountUser({ account: { name: "error" }, userData: {} });
//     }

//     //const data = await result.json();
//     //before dispacthing convert it to required format
//   }, [dispatch, initAccountUser]);
