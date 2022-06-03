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
import { getALMConfig } from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { RestAdapter } from "../utils/restAdapter";

class AkamaiCustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCdnBaseUrl = this.almConfig.almCdnBaseUrl;

  async getTraining(id: string) {
    const loPath = id.replace(":", "/");
    const response = await RestAdapter.get({
      url: `${this.almCdnBaseUrl}/${loPath}.json`,
    });
    return JsonApiParse(response).learningObject;
  }
}

const AkamaiCustomHooksInstance = new AkamaiCustomHooks();
export default AkamaiCustomHooksInstance;
