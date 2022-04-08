/*
 * Copyright 2022 Adobe. All rights reserved. This file is licensed to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in compliance with the License. You
 * may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (document, window, $) {
    "use strict";

    function handlePageRedirect()
    {
        const currentURL = new URL(window.location.href);
        if (currentURL)
        {
            let route = currentURL.searchParams.get("route");
            if (route)
            {
                let routeParams = route.split("/");
                if (routeParams && routeParams.length == 2)
                {
                    window.ALM.navigateToTrainingOverviewPage(routeParams[0] + ":" + routeParams[1]);
                }
            }

            let certificationId =  currentURL.searchParams.get("certificationId");
            if (certificationId)
            {
                window.ALM.navigateToTrainingOverviewPage("certification:" + certificationId);
            }
        }
    }
    
    handlePageRedirect();

})(document, window, jQuery);
