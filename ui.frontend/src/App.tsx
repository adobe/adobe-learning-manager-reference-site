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
import {
  ALMSkillComponent,
  CommerceContextProvider,
  Portal,
  PrimeCatalogContainer,
  PrimeCommunityBoardList,
  PrimeCommunityBoardPage,
  PrimeInstancePage,
  PrimeNotificationContainer,
  PrimeTrainingPage,
} from "./almLib";
import "./App.css";
import { mountingPoints } from "./config/config";
import { AppContextProvider } from "./contextProviders";

const App = (props: any) => {
  // const { mountingPoints } = config;
  //store.subscribe(() => console.log(store.getState()));
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
          {/* <Portal selector={mountingPoints.profilePageContainer}>
            <ALMProfilePage />
          </Portal> */}
          <Portal selector={mountingPoints.userSkillsContainer}>
            <ALMSkillComponent />
          </Portal>
          {/* <Portal selector={mountingPoints.activeFieldsContainer}>
            <ActiveFieldsContainter />
          </Portal> */}
          <Portal selector={mountingPoints.boardContainer}>
            <PrimeCommunityBoardPage />
          </Portal>
          <Portal selector={mountingPoints.boardsContainer}>
            <PrimeCommunityBoardList />
          </Portal>
        </AppContextProvider>
      </CommerceContextProvider>
    </IntlProvider>
  );
};

export default App;
