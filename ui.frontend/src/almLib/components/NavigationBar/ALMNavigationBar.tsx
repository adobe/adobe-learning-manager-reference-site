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
import { useIntl } from "react-intl";
import styles from "./ALMNavigationBar.module.css";
import { Link, useLocation } from "react-router-dom";
import { CATALOG, HOME } from "../../utils/constants";
import { useEffect, useMemo, useState } from "react";
import { getRegistrationsURLs } from "../../utils/global";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import Close from "@spectrum-icons/workflow/Close";

const ALMNavigationBar = (props: any) => {
  const location = useLocation();
  const { formatMessage } = useIntl();

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const accountJson = props.accountJson;

  const accountData = JSON.parse(accountJson.accountData);
  const accountConfig = accountJson.accountConfig;

  const accountAttributes = accountData ? accountData.data.attributes : {};

  const companyLogo = accountAttributes?.logoUrl || "";
  const companyName = accountAttributes?.name || "";

  const { signUpURL, signInURL } = useMemo(() => {
    return getRegistrationsURLs(accountConfig, accountJson.almDomain);
  }, [accountConfig, accountJson.almDomain]);

  const setActiveButtonCss = (buttonLabel: string) => {
    let homeButton = document.getElementById(HOME);
    let catalogButton = document.getElementById(CATALOG);
    const activeMenuCss = "3px solid var(--prime-color-primary)";
    const NONE = "none";
    if (homeButton && catalogButton) {
      if (buttonLabel.indexOf(HOME) > -1) {
        homeButton.style.borderBottom = activeMenuCss;
        catalogButton.style.borderBottom = NONE;
      } else {
        homeButton.style.borderBottom = NONE;
        catalogButton.style.borderBottom = activeMenuCss;
      }
    }
  };

  const goToHomePage = () => {
    setActiveButtonCss(HOME);
  };

  const goToCatalogPage = () => {
    setActiveButtonCss(CATALOG);
  };

  const setActiveTab = () => {
    if (window.location.pathname.indexOf(HOME) > -1) {
      setActiveButtonCss(HOME);
    } else if (window.location.pathname.indexOf(CATALOG) > -1) {
      setActiveButtonCss(CATALOG);
    }
  };

  const getHomeButton = () => {
    return (
      <Link
        to={props.homeLink}
        id={HOME}
        className={styles.homeButton}
        onClick={goToHomePage}
      >
        {formatMessage({ id: "alm.text.home" })}
      </Link>
    );
  };

  const getCatalogButton = () => {
    return (
      <Link
        to={props.catalogLink}
        id={CATALOG}
        className={styles.catalogButton}
        onClick={goToCatalogPage}
      >
        {formatMessage({ id: "alm.text.catalog" })}
      </Link>
    );
  };

  const getSignUpButton = () => {
    return (
      <a href={signUpURL} className={styles.signUpButton}>
        {formatMessage({ id: "alm.text.signUp" })}
      </a>
    );
  };
  const getSignInButton = () => {
    return (
      <a href={signInURL} className={styles.signInButton}>
        {formatMessage({ id: "alm.text.signIn" })}
      </a>
    );
  };

  useEffect(() => {
    setActiveTab();
  }, [location]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const showLogo = () => {
    return accountData && accountData.data.attributes.logoStyling
      ? accountData.data.attributes.logoStyling.indexOf("LOGO") > -1
      : true;
  };

  const showOrgName = () => {
    return accountData && accountData.data.attributes.logoStyling
      ? accountData.data.attributes.logoStyling.indexOf("NAME") > -1
      : true;
  };

  return (
    <div className={styles.header}>
      <div className={styles.navbarFixed}>
        <div className={styles.navbar}>
          <div className={styles.mobileMenuIcon} onClick={toggleMobileMenu}>
            <ShowMenu />
          </div>
          {showLogo() && (
            <img
              className={styles.companyLogo}
              src={companyLogo}
              alt={companyLogo}
            />
          )}
          {showOrgName() && (
            <div className={styles.companyName}>{companyName}</div>
          )}
          <ul className={styles.headerMenu}>
            <li>{getHomeButton()}</li>
            <li>{getCatalogButton()}</li>
          </ul>
          <div className={styles.actionMenu}>
            {getSignUpButton()}
            {getSignInButton()}
          </div>
          {showMobileMenu && (
            <div className={styles.mobileMenu}>
              <div className={styles.mobileMenuOptions}>
                <div
                  className={styles.closeMenuButton}
                  onClick={toggleMobileMenu}
                >
                  <Close />
                </div>
                <hr className={styles.primeVerticalSeparator}></hr>

                <div
                  className={styles.mobileMenuOption}
                  onClick={toggleMobileMenu}
                >
                  {getHomeButton()}
                </div>
                <hr className={styles.primeVerticalSeparator}></hr>

                <div
                  className={styles.mobileMenuOption}
                  onClick={toggleMobileMenu}
                >
                  {getCatalogButton()}
                </div>
                <hr className={styles.primeVerticalSeparator}></hr>

                <div
                  className={styles.mobileMenuOption}
                  onClick={toggleMobileMenu}
                >
                  {getSignUpButton()}
                </div>
                <hr className={styles.primeVerticalSeparator}></hr>

                <div
                  className={styles.mobileMenuOption}
                  onClick={toggleMobileMenu}
                >
                  {getSignInButton()}
                </div>
                <hr className={styles.primeVerticalSeparator}></hr>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ALMNavigationBar;
