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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { getALMConfig } from "../../../utils/global";
import { JsonApiParse } from "../../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../../utils/restAdapter";

export function useLeaderboard() {
  async function getCompetitors() {
    const params: QueryParams = {};
    params["page[limit]"] = 5;
    params["filter"] = "gamificationAll";
    const response = await RestAdapter.get({
      url: `${getALMConfig().primeApiURL}/users`,
      params: params,
    });
    const parsedResponse = JsonApiParse(response);
    return parsedResponse;
  }

  return {
    getCompetitors,
  };
}
