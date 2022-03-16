/*
 * Copyright 2021 Adobe. All rights reserved. This file is licensed to you under the Apache License,
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

    const HEADER_PROFILE_PIC_SEL = ".alm-header-profile";

    $(document).ready(function () {
        window.ALM.getALMUser().then(function (data) {
            console.log("Hi");
            const jsonObj = JSON.parse(data);
            const avatarUrl = jsonObj.data.attributes.avatarUrl;
            $(HEADER_PROFILE_PIC_SEL).attr("src", avatarUrl);
            console.log(data);
        });
    });

})(document, window, jQuery);
