import { CatalogFilterState } from "../store/reducers/catalog";
import ICustomHooks from "../common/ICustomHooks";
import LoggedInCustomHooks from "./LoggedInCustomHooks";
import NonLoggedInCustomHooks from "./NonLoggedInCustomHooks";
export default class APIService {

    //customHooks: ICustomHooks;
    
    constructor() {
        //this.customHooks = this.isUserLoggedIn() ? new LoggedInCustomHooks() : new NonLoggedInCustomHooks();
    }

    isUserLoggedIn() {
        // add logic to check is logged in user
        return true;
    }


    public async getTrainings(filterState: CatalogFilterState, sort: string) {
    
        if(this.isUserLoggedIn()) {
            //this.customHooks = new LoggedInCustomHooks();
           return new LoggedInCustomHooks().getTrainings(filterState,sort);
            
        }
        //this.customHooks = new NonLoggedInCustomHooks();
       // return this.customHooks.getTrainings(filterState,sort);
       return new NonLoggedInCustomHooks().getTrainings(filterState,sort);

    }
    

}