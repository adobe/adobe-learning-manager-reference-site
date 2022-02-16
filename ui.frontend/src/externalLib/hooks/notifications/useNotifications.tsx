import { useCallback, useEffect , useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useConfigContext, useUserContext } from "../../contextProviders";
import APIServiceInstance from "../../common/APIService";
import { State } from "../../store/state";

import {
    loadNotifications,
    paginateNotifications,
  } from "../../store/actions/notification/action";
import { PrimeUserNotification } from "../../models";

export const useNotifications = () => {
    
    const { notifications, next} = useSelector(
        (state: State) => state.notification
      );
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const config = useConfigContext();
    const {user} = useUserContext();
    console.log(user.id);
    const fetchNotifications = useCallback(async () => {
        try {
          const params: QueryParams = {};
          params["page[limit]"] = 6;
            const response = await RestAdapter.get({
                url: `${config.baseApiUrl}/users/10866105/userNotifications`, 
                params: params
              });
              const parsedResponse = JsonApiParse(response);
              const notificationData: any = {}; 
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
       
        fetchNotifications();
      }, [fetchNotifications, user.id]);

        //for pagination
    const loadMoreNotifications = useCallback(async () => {
      if (!next) return;
      const parsedResponse = await APIServiceInstance.loadMore(next);
      dispatch(
        paginateNotifications({
          notifications: parsedResponse!.userNotificationList || [],
          next: parsedResponse!.links?.next || "",
        })
      );
    }, [dispatch, next]);

    return {
        notifications, 
        isLoading, 
        loadMoreNotifications
      };
}