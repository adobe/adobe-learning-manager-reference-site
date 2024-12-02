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
import { IntlProvider } from "react-intl";
import { mountingPoints } from "./config/config";
import { AppContextProvider } from "./contextProviders";
import {
  ActiveFieldsContainter,
  ALMSkillComponent,
  ALMUserProfile,
  CommerceContextProvider,
  Portal,
  PrimeCatalogContainer,
  PrimeCommunityBoardList,
  PrimeCommunityBoardPage,
  PrimeInstancePage,
  PrimeNotificationContainer,
  PrimeTrainingPage,
  ALMMasthead,
  ALMCategoryBrowser,
  ALMNavigationBar,
  ALMFooter,
  PrlPreferenceSection,
} from "./almLib";

import "./almLib/utils/global";
import "./App.css";
import ALMPrimeWidgets from "./almLib/components/Widgets/ALMPrimeWidgets/ALMPrimeWidgets";
import { CalendarWidget } from "./almLib/components/CalendarWidget";
import { GetPrimeObj, WinInit } from "./almLib/utils/widgets/windowWrapper";
import { PrimeAuthorPage } from "./almLib/components/Author";
const App = (props: any) => {
  return (
    <IntlProvider locale={props.locale} messages={props.messages}>
      <div id="alertDialog"></div>
      <CommerceContextProvider>
        <AppContextProvider>
          <Portal selector={mountingPoints.notificationContainer}>
            <PrimeNotificationContainer />
          </Portal>

          <Portal selector={mountingPoints.catalogContainer}>
            <PrimeCatalogContainer />
          </Portal>
          <Portal selector={mountingPoints.trainingOverviewPage}>
            <PrimeTrainingPage />
          </Portal>
          <Portal selector={mountingPoints.instanceContainer}>
            <PrimeInstancePage />
          </Portal>
          <Portal selector={mountingPoints.profilePageContainer}>
            <ALMUserProfile />
          </Portal>
          <Portal selector={mountingPoints.userSkillsContainer}>
            <ALMSkillComponent />
          </Portal>
          <Portal selector={mountingPoints.activeFieldsContainer}>
            <ActiveFieldsContainter />
          </Portal>
          <Portal selector={mountingPoints.boardContainer}>
            <PrimeCommunityBoardPage />
          </Portal>
          <Portal selector={mountingPoints.boardsContainer}>
            <PrimeCommunityBoardList />
          </Portal>
          <Portal selector={mountingPoints.navigationBarContainer}>
            <ALMNavigationBar />
          </Portal>
          <Portal selector={mountingPoints.mastHeadContainer}>
            <ALMMasthead />
          </Portal>
          <Portal selector={mountingPoints.categoryBrowserContainer}>
            <ALMCategoryBrowser />
          </Portal>
          <Portal selector={mountingPoints.footerContainer}>
            <ALMFooter />
          </Portal>
          <Portal selector={mountingPoints.authorContainer}>
            <PrimeAuthorPage />
          </Portal>
          <Portal selector={mountingPoints.calendarWidgetContainer}>
            <CalendarWidget numCards={2} />
          </Portal>
          <Portal selector={mountingPoints.userRecommendationsContainer}>
            <PrlPreferenceSection />
          </Portal>
          <Portal selector={mountingPoints.layoutContainer}>
            <ALMPrimeWidgets />
          </Portal>
        </AppContextProvider>
      </CommerceContextProvider>
    </IntlProvider>
  );
};

export default App;
