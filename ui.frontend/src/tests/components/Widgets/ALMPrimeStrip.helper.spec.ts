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
import {
  showAddToMyLearning,
  showNavIcons,
  showSkills,
} from '../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper';
import { Widget, WidgetTypeNew } from '../../../almLib/utils/widgets/common';

describe('ALMPrimeStrip.helper', () => {
  describe('showNavIcons', () => {
    const buildWidget = (type: WidgetTypeNew): Widget =>
      ({
        type,
      }) as Widget;

    it('should return false when widget is VIRTUAL_COACH and isMobile is true', () => {
      const widget = buildWidget(WidgetTypeNew.VIRTUAL_COACH);
      expect(showNavIcons(widget, true)).toBe(false);
    });

    it('should return true when widget is VIRTUAL_COACH and isMobile is false', () => {
      const widget = buildWidget(WidgetTypeNew.VIRTUAL_COACH);
      expect(showNavIcons(widget, false)).toBe(true);
    });

    it('should return true when widget is VIRTUAL_COACH and isMobile is undefined', () => {
      const widget = buildWidget(WidgetTypeNew.VIRTUAL_COACH);
      expect(showNavIcons(widget)).toBe(true);
    });

    it('should return true for non VIRTUAL_COACH widget types on mobile', () => {
      const nonVirtualCoachTypes = [
        WidgetTypeNew.MYLEARNING,
        WidgetTypeNew.BOOKMARKS,
        WidgetTypeNew.ADMIN_RECO,
        WidgetTypeNew.AOI_RECO,
        WidgetTypeNew.TRENDING_RECO,
        WidgetTypeNew.DISCOVERY_RECO,
        WidgetTypeNew.RECOMMENDATIONS_STRIP,
        WidgetTypeNew.CATALOG_BROWSER,
      ];

      nonVirtualCoachTypes.forEach(type => {
        expect(showNavIcons(buildWidget(type), true)).toBe(true);
      });
    });

    it('should return true for non VIRTUAL_COACH widget types on desktop', () => {
      const nonVirtualCoachTypes = [
        WidgetTypeNew.MYLEARNING,
        WidgetTypeNew.BOOKMARKS,
        WidgetTypeNew.ADMIN_RECO,
      ];

      nonVirtualCoachTypes.forEach(type => {
        expect(showNavIcons(buildWidget(type), false)).toBe(true);
      });
    });
  });

  describe('showAddToMyLearning', () => {
    const buildWidget = (type: WidgetTypeNew): Widget =>
      ({
        type,
      }) as Widget;

    it('should return false for VIRTUAL_COACH widget', () => {
      expect(showAddToMyLearning(buildWidget(WidgetTypeNew.VIRTUAL_COACH))).toBe(false);
    });

    it('should return true for non VIRTUAL_COACH widget types', () => {
      const nonVirtualCoachTypes = [
        WidgetTypeNew.MYLEARNING,
        WidgetTypeNew.BOOKMARKS,
        WidgetTypeNew.ADMIN_RECO,
        WidgetTypeNew.AOI_RECO,
        WidgetTypeNew.TRENDING_RECO,
      ];

      nonVirtualCoachTypes.forEach(type => {
        expect(showAddToMyLearning(buildWidget(type))).toBe(true);
      });
    });
  });

  describe('showSkills', () => {
    const buildWidget = (type: WidgetTypeNew): Widget => ({ type }) as Widget;

    it('should return true for PERSONALIZED_PATH_STRIP', () => {
      expect(showSkills(buildWidget(WidgetTypeNew.PERSONALIZED_PATH_STRIP))).toBe(true);
    });

    it('should return true for other skill-enabled widget types', () => {
      const skillEnabledTypes = [
        WidgetTypeNew.DISCOVERY_RECO,
        WidgetTypeNew.AOI_RECO,
        WidgetTypeNew.TRENDING_RECO,
      ];
      skillEnabledTypes.forEach(type => {
        expect(showSkills(buildWidget(type))).toBe(true);
      });
    });

    it('should return true for MYLEARNING widget', () => {
      expect(showSkills(buildWidget(WidgetTypeNew.MYLEARNING))).toBe(true);
    });

    it('should return false for CATALOG_BROWSER widget', () => {
      expect(showSkills(buildWidget(WidgetTypeNew.CATALOG_BROWSER))).toBe(false);
    });
  });
});
