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

    const HEADER_LOG_IN_REL = ".alm-log-in";
    const HEADER_LOG_OUT_REL = ".alm-log-out";
    const HEADER_PROFILE_TEXT_REL = ".alm-profile__text";
    const HEADER_NOTIFICATION_REL = ".alm-header-icons .notification__container";

    const DEFAULT_USER_AVATAR = "/content/dam/learning/site/default_user_avatar.svg";

    function renderLoginButtons()
    {
      if(window.ALM.isPrimeUserLoggedIn())
      {
        $(HEADER_LOG_IN_REL).hide();
        $(HEADER_LOG_OUT_REL).show();
        $(HEADER_PROFILE_TEXT_REL).show();
      }
      else
      {
        $(HEADER_LOG_IN_REL).show();
        $(HEADER_LOG_OUT_REL).hide();
        $(HEADER_PROFILE_TEXT_REL).hide();
      }
    }

    function fetchProfileDetails()
    {
        if (window.ALM.isPrimeUserLoggedIn()) {
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
        }
    }

    $(document).ready(function () {
        renderLoginButtons();
        $(HEADER_LOG_IN_REL).on("click", () => window.ALM.handleLogIn());
        $(HEADER_LOG_OUT_REL).on("click", () => window.ALM.handleLogOut());

        if (window.ALM.isPrimeUserLoggedIn())
        {
            fetchProfileDetails();
            $(COMMUNITY_NAVIGATE_SEL).on("click", () => window.ALM.navigateToCommunityPage());
        }
        else
        {
            $(HEADER_PROFILE_PIC_SEL).attr("src", DEFAULT_USER_AVATAR);
        }

        $(HOME_NAVIGATE_SEL).on("click", () => window.ALM.navigateToHomePage());
        $(LEARNING_NAVIGATE_SEL).on("click", () => window.ALM.navigateToLearningPage());
        $(SUPPORT_NAVIGATE_SEL).on("click", () => window.ALM.navigateToSupportPage());

        $(VERT_NAV_CLOSE_BUTTON_SEL + "," + HEADER_SHOW_MENU_SEL).on("click", () => {
            $(VERT_NAV_CONTAINER_SEL).toggleClass('open');
        });

        $(HEADER_PROFILE_OPTIONS_SEL).on("click", () => {
            $(HEADER_PROFILE_OPTIONS_CONT_SEL).toggle();
        });

    });
  });
})(document, window, jQuery);
