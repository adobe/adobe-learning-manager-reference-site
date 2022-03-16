
(function (document, window, $) {
    "use strict";

    const HEADER_PROFILE_PIC_SEL = ".alm-header-profile";

    $(document).ready(function () {
        window.ALM.getALMUser().then(function (user) {
            try 
            {
                const avatarUrl = JSON.parse(user).data.attributes.avatarUrl;
                $(HEADER_PROFILE_PIC_SEL).attr("src", avatarUrl);
            } catch (e)
            {
                console.error("Unable to fetch user avatar.");
            }
        });
    });

})(document, window, jQuery);
