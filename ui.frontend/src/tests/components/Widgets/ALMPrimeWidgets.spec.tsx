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
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ALMPrimeWidgets from '@components/Widgets/ALMPrimeWidgets/ALMPrimeWidgets';

// ─── Shared state container (survives resetMocks:true as a plain object) ──────

const mockGlobal = { homePageLayoutConfig: null as any, guest: false };
const mockSendMessageToParent = jest.fn();

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@utils/global', () => ({
  getALMUser: jest.fn(),
  getALMConfig: jest.fn(() => mockGlobal),
  getWidgetConfig: jest.fn(() => ({ isMobile: false })),
  getWindowObject: jest.fn(() => ({ innerWidth: 1024, addEventListener: jest.fn() })),
  setHomePageLayoutConfig: jest.fn((c: any) => { mockGlobal.homePageLayoutConfig = c; }),
  GetPrimeEmitEventLinks: jest.fn(() => []),
}));

// generateWidgetsForLayout populates homePageLayoutConfig.widgets from layoutConfigObj.widgets
// so the rendered ALMSimpleRowLayoutEngine can expose them via data-testid.
jest.mock('@utils/widgets/utils', () => ({
  randomIdGenerator: jest.fn(() => 'test-id'),
  GetJsonParsedIfNeeded: jest.fn((v: any) => (typeof v === 'string' ? JSON.parse(v) : v)),
  configureWidgetsForLayout: jest.fn((widgets: any) => widgets),
  generateWidgetsForLayout: jest.fn((layoutConfigObj: any, homePageLayoutConfig: any) => {
    homePageLayoutConfig.widgets = (layoutConfigObj.widgets || []).map((row: any) => ({
      widgets: Array.isArray(row) ? row : [row],
      id: 'row',
    }));
  }),
  updateWidgetsForLayout: jest.fn(),
  ApplyWidgetOverrides: jest.fn(),
  fixWidgetAttributes: jest.fn(),
}));

jest.mock('@utils/catalog', () => ({
  debounce: (fn: any) => fn,
}));

jest.mock('@utils/widgets/base/EventHandlingBase', () => ({
  SendMessageToParent: (...args: any[]) => mockSendMessageToParent(...args),
}));

jest.mock('@components/Widgets/ALMSimpleRowLayoutEngine', () => ({
  ALMSimpleRowLayoutEngine: ({ config }: any) => (
    <div data-testid="layout-engine">
      {(config?.widgets || []).flatMap((row: any, ri: number) =>
        (row.widgets || []).map((w: any, wi: number) => (
          <div
            key={`${ri}-${wi}`}
            data-testid={`widget-${(w.widgetRef || '').replace(/\./g, '-')}`}
          />
        ))
      )}
    </div>
  ),
}));

jest.mock('@components/Common/ALMErrorBoundary', () => ({
  ALMErrorBoundary: ({ children }: any) => <>{children}</>,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VIRTUAL_COACH_REF = 'com.adobe.captivateprime.lostrip.virtualcoach';
const MASTHEAD_REF = 'com.adobe.captivateprime.masthead';
const MYLEARNING_REF = 'com.adobe.captivateprime.lostrip.mylearning';
const BOOKMARKS_REF = 'com.adobe.captivateprime.lostrip.mybookmarks';
const LEADERBOARD_REF = 'com.adobe.captivateprime.leaderboard';

const testId = (ref: string) => `widget-${ref.replace(/\./g, '-')}`;

const makeWidgetConfig = (widgets: any[]) => ({
  attributes: {
    layoutConfig: JSON.stringify({ widgets }),
    widgetOverrides: {},
  },
} as any);

const makeUser = (accountOverrides: any = {}) => ({
  account: { enableAiCoach: true, ...accountOverrides },
});

const renderAndWait = async (props: any = {}) => {
  let result: any;
  await act(async () => {
    result = render(<ALMPrimeWidgets {...props} />);
  });
  return result!;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// Track keydown handlers registered by the component so we can clean them up
// between tests. Without this, each mount adds a new handler to `document`
// and the accumulated calls inflate mockSendMessageToParent's call count.
let capturedKeydownHandlers: EventListener[] = [];

describe('ALMPrimeWidgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobal.homePageLayoutConfig = null;
    mockGlobal.guest = false;

    capturedKeydownHandlers = [];
    const origAdd = document.addEventListener.bind(document);
    jest.spyOn(document, 'addEventListener').mockImplementation(
      (type: string, handler: any, ...rest: any[]) => {
        if (type === 'keydown') capturedKeydownHandlers.push(handler);
        return origAdd(type, handler, ...rest);
      }
    );

    const {
      getALMUser,
      getALMConfig,
      getWidgetConfig,
      getWindowObject,
      GetPrimeEmitEventLinks,
      setHomePageLayoutConfig,
    } = require('@utils/global');
    getALMUser.mockResolvedValue({ user: makeUser() });
    getALMConfig.mockImplementation(() => mockGlobal);
    getWidgetConfig.mockReturnValue({ isMobile: false });
    getWindowObject.mockReturnValue({ innerWidth: 1024, addEventListener: jest.fn() });
    GetPrimeEmitEventLinks.mockReturnValue([]);
    setHomePageLayoutConfig.mockImplementation((c: any) => {
      mockGlobal.homePageLayoutConfig = c;
    });

    const utils = require('@utils/widgets/utils');
    utils.randomIdGenerator.mockReturnValue('test-id');
    utils.GetJsonParsedIfNeeded.mockImplementation((v: any) =>
      typeof v === 'string' ? JSON.parse(v) : v
    );
    utils.configureWidgetsForLayout.mockImplementation((widgets: any) => widgets);
    utils.generateWidgetsForLayout.mockImplementation(
      (layoutConfigObj: any, homePageLayoutConfig: any) => {
        homePageLayoutConfig.widgets = (layoutConfigObj.widgets || []).map((row: any) => ({
          widgets: Array.isArray(row) ? row : [row],
          id: 'row',
        }));
      }
    );
    utils.updateWidgetsForLayout.mockImplementation(() => {});
    utils.ApplyWidgetOverrides.mockImplementation(() => {});
    utils.fixWidgetAttributes.mockImplementation(() => {});
  });

  afterEach(() => {
    capturedKeydownHandlers.forEach(h => document.removeEventListener('keydown', h));
    jest.restoreAllMocks();
  });

  describe('Body Class Effect', () => {
    it('mount_homeBackgroundClassAddedToBody', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      expect(document.body.classList.contains('home-bg-class-transparent')).toBe(true);
    });

    it('unmount_homeBackgroundClassRemovedFromBody', async () => {
      const { unmount } = await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      expect(document.body.classList.contains('home-bg-class-transparent')).toBe(true);
      act(() => { unmount(); });
      expect(document.body.classList.contains('home-bg-class-transparent')).toBe(false);
    });
  });

  describe('Virtual Coach Widget', () => {
    it('enableAiCoach_notGuest_mastheadPresent_virtualCoachInsertedAfterMasthead', async () => {
      // enableAiCoach=true (default), guest=false (default), masthead present
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.getByTestId(testId(VIRTUAL_COACH_REF))).toBeInTheDocument();
      expect(screen.getByTestId(testId(MASTHEAD_REF))).toBeInTheDocument();
    });

    it('enableAiCoachFalse_virtualCoachNotAdded', async () => {
      const { getALMUser } = require('@utils/global');
      getALMUser.mockResolvedValue({ user: makeUser({ enableAiCoach: false }) });
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.queryByTestId(testId(VIRTUAL_COACH_REF))).toBeNull();
    });

    it('guestMode_virtualCoachNotAdded', async () => {
      mockGlobal.guest = true;
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.queryByTestId(testId(VIRTUAL_COACH_REF))).toBeNull();
    });

    it('mastheadAbsent_virtualCoachNotAdded', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MYLEARNING_REF, id: 'ml' }]]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.queryByTestId(testId(VIRTUAL_COACH_REF))).toBeNull();
    });
  });

  describe('Bookmarks Widget', () => {
    it('noBookmark_mylearningPresent_noSocialRow_bookmarkAddedAfterMylearning', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([
          [{ widgetRef: MASTHEAD_REF, id: 'masthead' }],
          [{ widgetRef: MYLEARNING_REF, id: 'ml' }],
        ]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.getByTestId(testId(BOOKMARKS_REF))).toBeInTheDocument();
    });

    it('noBookmark_mylearningPresent_leaderboardRowPresent_bookmarkAddedAfterLeaderboardRow', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([
          [{ widgetRef: MYLEARNING_REF, id: 'ml' }],
          [{ widgetRef: LEADERBOARD_REF, id: 'lb' }],
        ]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.getByTestId(testId(BOOKMARKS_REF))).toBeInTheDocument();
    });

    it('bookmarkAlreadyPresent_noDuplicate', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([
          [{ widgetRef: MYLEARNING_REF, id: 'ml' }],
          [{ widgetRef: BOOKMARKS_REF, id: 'bm' }],
        ]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.getAllByTestId(testId(BOOKMARKS_REF))).toHaveLength(1);
    });

    it('mylearningAbsent_bookmarkNotAdded', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      await screen.findByTestId('layout-engine');
      expect(screen.queryByTestId(testId(BOOKMARKS_REF))).toBeNull();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('altKey_keyInRange_sendMessageToParentCalled', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      // key=49 ('1') satisfies key > 48 && key < 53
      fireEvent.keyDown(document, { altKey: true, which: 49 });
      expect(mockSendMessageToParent).toHaveBeenCalledTimes(1);
    });

    it('altKey_keyOutOfRange_noMessage', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      // key=53 ('5') fails key < 53
      fireEvent.keyDown(document, { altKey: true, which: 53 });
      expect(mockSendMessageToParent).not.toHaveBeenCalled();
    });

    it('noAltKey_noMessage', async () => {
      await renderAndWait({
        widgetConfig: makeWidgetConfig([[{ widgetRef: MASTHEAD_REF, id: 'masthead' }]]),
      });
      fireEvent.keyDown(document, { altKey: false, which: 49 });
      expect(mockSendMessageToParent).not.toHaveBeenCalled();
    });
  });

  describe('Add Personalized Path Widget', () => {
    const PLP_WIDGET_REF = 'com.adobe.captivateprime.lostrip.personalizedpathstrip';
    const PLP_WIDGET_TEST_ID = `widget-${PLP_WIDGET_REF.replace(/\./g, '-')}`;

    const layoutWithMyLearning = {
      widgets: [[{ widgetRef: 'com.adobe.captivateprime.lostrip.mylearning', id: 'mylearning' }]],
    };
    const widgetConfigWithMyLearning = {
      attributes: {
        layoutConfig: JSON.stringify(layoutWithMyLearning),
        widgetOverrides: {},
      },
    };

    it('adds personalized path widget when personalizedPathEnabled is true', async () => {
      const { getALMUser } = require('../../../almLib/utils/global');
      (getALMUser as jest.Mock).mockResolvedValueOnce({
        user: { account: { personalizedPathEnabled: true } },
      });

      render(<ALMPrimeWidgets widgetConfig={widgetConfigWithMyLearning as any} />);

      await screen.findByTestId('layout-engine', {}, { timeout: 3000 });

      expect(screen.getByTestId(PLP_WIDGET_TEST_ID)).toBeInTheDocument();
    });

    it('does not add personalized path widget when personalizedPathEnabled is false', async () => {
      const { getALMUser } = require('../../../almLib/utils/global');
      (getALMUser as jest.Mock).mockResolvedValueOnce({
        user: { account: { personalizedPathEnabled: false } },
      });

      render(<ALMPrimeWidgets widgetConfig={widgetConfigWithMyLearning as any} />);

      await screen.findByTestId('layout-engine', {}, { timeout: 3000 });

      expect(screen.queryByTestId(PLP_WIDGET_TEST_ID)).not.toBeInTheDocument();
    });

    it('does not add personalized path widget when personalizedPathEnabled is undefined', async () => {
      const { getALMUser } = require('../../../almLib/utils/global');
      (getALMUser as jest.Mock).mockResolvedValueOnce({
        user: { account: {} },
      });

      render(<ALMPrimeWidgets widgetConfig={widgetConfigWithMyLearning as any} />);

      await screen.findByTestId('layout-engine', {}, { timeout: 3000 });

      expect(screen.queryByTestId(PLP_WIDGET_TEST_ID)).not.toBeInTheDocument();
    });
  });
});
