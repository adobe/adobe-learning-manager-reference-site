import { AEMLearnAccount, AEMLearnUser } from "../models/AEMLearnModels";
export interface Authentication {
    accessToken: string;
}

export interface State {
    accessToken: string;
    user: AEMLearnUser;
    account: AEMLearnAccount;
}