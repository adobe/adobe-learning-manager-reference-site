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
import { PrimeAccount, PrimeUser } from "../models/PrimeModels";
import { CatalogState } from "./reducers/catalog";
import { NotificationState } from "./reducers/notification";
import { SocialState } from "./reducers/social";
import { FileUpload } from "./reducers/fileUpload";
import { UserSkillInterestState } from "./reducers/userSkillInterest";
import { SkillState } from "./reducers/skill";
import { SearchState } from "./reducers/search";
import { BadgeState } from "./reducers/badge";
export interface Authentication {
  accessToken: string;
}

export interface State {
  accessToken: string;
  user: PrimeUser;
  account: PrimeAccount;
  catalog: CatalogState;
  notification: NotificationState;
  badge: BadgeState;
  social: SocialState;
  fileUpload: FileUpload;
  userSkillInterest: UserSkillInterestState;
  skill: SkillState;
  search: SearchState;
}
