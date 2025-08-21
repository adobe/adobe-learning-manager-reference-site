/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

(function (document, window, $) {
    "use strict";

    function handlePageRedirect()
    {
        let foundRedirect = false;
        const currentURL = new URL(window.location.href);
        if (currentURL && currentURL.hash)
        {
            let params = currentURL.hash.match(/([A-Za-z]+)\/(\d+)(.*)/);
            if (params && params.length >= 3)
            {
                foundRedirect = true;
                if(params[1] === "boardId") {
                    window.ALM.navigateToBoardDetailsPage(params[2]);
                } else {
                    window.ALM.navigateToTrainingOverviewPage(params[1] + ":" + params[2]);
                }
            }
        }
        if (!foundRedirect) {
            window.ALM.navigateToHomePage();
        }
    }
    
    handlePageRedirect();

})(document, window, jQuery);
