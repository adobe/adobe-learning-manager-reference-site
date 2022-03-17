
(function (document, window, $) {
    "use strict";

    const HEADER_SHOW_MENU_SEL = ".alm-header-cont .alm-header-menu"
    const HEADER_PROFILE_PIC_SEL = ".alm-header-profile";
    const VERT_NAV_CONTAINER_SEL = ".alm-header-vertical-nav";
    const VERT_NAV_CLOSE_BUTTON_SEL = ".vert-nav-close-button"
    const VERT_NAV_PROFILE_NAME_SEL = ".vert-nav-profile-name";

    $(document).ready(function () {
        window.ALM.getALMUser().then(function (user) {
            try 
            {
                const userAttrs = JSON.parse(user).data.attributes;
                $(HEADER_PROFILE_PIC_SEL).attr("src", userAttrs.avatarUrl);
                $(VERT_NAV_PROFILE_NAME_SEL).text(userAttrs.name);
            } catch (e)
            {
                console.error("Unable to fetch user avatar.");
            }
        });

        $(document).on("click", VERT_NAV_CLOSE_BUTTON_SEL, function(e) {
            $(VERT_NAV_CONTAINER_SEL).toggle();
        });

        $(document).on("click", HEADER_SHOW_MENU_SEL, function(e) {
            $(VERT_NAV_CONTAINER_SEL).toggle();
        });
    });

})(document, window, jQuery);
