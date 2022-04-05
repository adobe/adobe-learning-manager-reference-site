import { PrimeAccount, PrimeUser } from "../models/PrimeModels";
import { CatalogState } from "./reducers/catalog";
import { NotificationState } from "./reducers/notification";
import { SocialState } from "./reducers/social";
import { FileUpload } from "./reducers/fileUpload";
import { UserSkillInterestState } from "./reducers/userSkillInterest"
import { SkillState } from "./reducers/skill"
export interface Authentication {
  accessToken: string;
}

export interface State {
  accessToken: string;
  user: PrimeUser;
  account: PrimeAccount;
  catalog: CatalogState;
  notification: NotificationState;
  social: SocialState;
  fileUpload: FileUpload;
  userSkillInterest: UserSkillInterestState;
  skill: SkillState;
}
