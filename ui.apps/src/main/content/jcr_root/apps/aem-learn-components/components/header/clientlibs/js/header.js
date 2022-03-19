
(function (document, window, $) {
    "use strict";

    const HEADER_SHOW_MENU_SEL = ".alm-header-cont .alm-header-menu"
    const HEADER_PROFILE_PIC_SEL = ".alm-header-profile";
    const HEADER_PROFILE_OPTIONS_SEL = ".alm-header-profile,.alm-header-down";
    const VERT_NAV_CLOSE_BUTTON_SEL = ".vert-nav-close-button"
    const VERT_NAV_PROFILE_NAME_SEL = ".vert-nav-profile-name";

    const VERT_NAV_CONTAINER_SEL = ".alm-header-vertical-nav";
    const VERT_NAV_PROFILE_PIC_SEL = ".vert-nav-profile-image";
    const HEADER_PROFILE_OPTIONS_CONT_SEL = ".alm-header-profile-options";

    const HOME_NAVIGATE_SEL = ".alm-home-navigate";
    const LEARNING_NAVIGATE_SEL = ".alm-learning-navigate";
    const COMMUNITY_NAVIGATE_SEL = ".alm-community-navigate";
    const SUPPORT_NAVIGATE_SEL = ".alm-support-navigate";

    $(document).ready(function () {
        window.ALM.getALMUser().then(function (user) {
            try {
                const userAttrs = JSON.parse(user).data.attributes;
                $(HEADER_PROFILE_PIC_SEL).attr("src", userAttrs.avatarUrl);
                $(VERT_NAV_PROFILE_NAME_SEL).text(userAttrs.name);

                $(VERT_NAV_PROFILE_PIC_SEL).attr("src", userAttrs.avatarUrl);
            } catch (e) {
                console.error("Unable to fetch user avatar.");
            }
        });

        $(HOME_NAVIGATE_SEL).on("click", () => window.ALM.navigateToHomePage());
        $(LEARNING_NAVIGATE_SEL).on("click", () => window.ALM.navigateToLearningPage());
        $(COMMUNITY_NAVIGATE_SEL).on("click", () => window.ALM.navigateToCommunityPage());
        $(SUPPORT_NAVIGATE_SEL).on("click", () => window.ALM.navigateToSupportPage());

        $(VERT_NAV_CLOSE_BUTTON_SEL + "," + HEADER_SHOW_MENU_SEL).on("click", () => {
            $(VERT_NAV_CONTAINER_SEL).toggleClass('open');
        });

        $(HEADER_PROFILE_OPTIONS_SEL).on("click", () => {
            $(HEADER_PROFILE_OPTIONS_CONT_SEL).toggle();
        });

    });

})(document, window, jQuery);
