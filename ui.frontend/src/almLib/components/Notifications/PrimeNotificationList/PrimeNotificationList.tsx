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
import {  useRef, useState } from "react";
import { PrimeNotificationItem } from "../PrimeNotificationItem";
import { useLoadMore } from "../../../hooks/loadMore";

import styles from "./PrimeNotificationList.module.css";
import { useIntl } from "react-intl";
import { ALMLoader } from "../../Common/ALMLoader";

const PrimeNotificationsList = (props: any) => {
  const [currId , setCurrId] = useState(0);
  const {
    notifications,
    loadMoreNotifications,
    redirectOverviewPage,
    isLoading,
  } = props;
  const elementRef = useRef(null);
  const { formatMessage } = useIntl();
  useLoadMore({
    items: notifications,
    callback: loadMoreNotifications,
    containerId: "notifications",
    elementRef,
  });

  
  const handleKeyPress = (event :any) =>{
    if(event.code==="Tab"){
      //setCurrId( currId + 1);
    }
    if(event.shiftKey && event.keyCode === 9){
      //setCurrId( currId - 1);
    }
    if(event.code==="ArrowDown"){

      let notificationItem = document.getElementById(`notification_${currId+1}`)

      notificationItem?.focus()
      setCurrId( currId + 1);
      if(currId===notifications?.length-1) setCurrId(notifications.length-1);

    }
    else if (event.code === "ArrowUp"){
      let notificationItem = document.getElementById(`notification_${currId-1}`)

      notificationItem?.focus()
      setCurrId( currId - 1);
      if(currId<=0) setCurrId(0);



    }
  }

  const handleAnyKeyPress = (event:any) =>{
    
  }



const notificationHTML =
    notifications?.length > 0 ? (
      <ul className={styles.notificationList}>
        {notifications?.map((entry: any) => (
          <PrimeNotificationItem
            notification={entry}
            key={entry.id}
            redirectOverviewPage={redirectOverviewPage}
            setAnnouncementOpen={props?.setAnnouncementOpen}
            setShowNotifications={props?.setShowNotifications}
            setAnnouncementData={props?.setAnnouncementData}
          ></PrimeNotificationItem>
        ))}
      </ul>
    ) : (
      <div className={styles.notificationEmpty}>
        {formatMessage({
          id: "alm.notification.empty",
          defaultMessage: "No notifications available",
        })}
      </div>
    );

  return (
    <div className={styles.notificationListBox} id="notifications">
      {isLoading ? (
        <div className={styles.notificationLoaderWrapper}>
          <ALMLoader />
        </div>
      ) : (
        notificationHTML
      )}
      <div ref={elementRef}></div>
    </div>
  );
};

export default PrimeNotificationsList;
