import { useCallback, useEffect , useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {  RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { getNotificationAsAstring } from "../../utils/notificationFormatter"
import { useConfigContext, useUserContext } from "../../contextProviders";
import { State } from "../../store/state";

import {
    loadNotifications,
    paginateNotifications,
  } from "../../store/actions/notification/action";
import { PrimeUserNotification } from "../../models";

export const useNotifications = () => {
    
    const { notifications} = useSelector(
        (state: State) => state.notification
      );
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const config = useConfigContext();
    const {user} = useUserContext();
    console.log(user.id);
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await RestAdapter.get({
                url: `${config.baseApiUrl}/users/${user.id}/userNotifications`
              });
              const parsedResponse = JsonApiParse(response);
              const notificationData: any = {}; 
              parsedResponse.userNotificationList?.map(entry => entry.message = getNotificationAsAstring(entry, "en-US"));
              notificationData["notifications"] = parsedResponse.userNotificationList || [];
              notificationData["next"] = parsedResponse.links?.next || "";

              console.log(notificationData["notifications"]);
              dispatch(loadNotifications(notificationData));
              setIsLoading(false);
        } catch (e) {
          dispatch(loadNotifications([] as PrimeUserNotification[]));
          console.log("Error while loading notifications " + e);
          setIsLoading(false);          
        }
      }, [dispatch, user.id]);

    useEffect(() => {
       if (user.id)
        fetchNotifications();
      }, [fetchNotifications, user.id]);
    return {
        notifications, 
        isLoading
      };
}