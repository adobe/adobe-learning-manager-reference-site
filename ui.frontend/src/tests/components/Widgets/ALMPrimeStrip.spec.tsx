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
import ALMPrimeStrip from '@components/Widgets/ALMPrimeStrip/ALMPrimeStrip';
import { WidgetTypeNew } from '../../../almLib/utils/widgets/common';

// ─── Module-level mock functions (closures survive resetMocks:true) ───────────

const mockUsePrimeStrip = jest.fn();
const mockUseFeedback = jest.fn();
const mockGetTranslation = jest.fn();
const mockGetALMConfig = jest.fn();
const mockGetALMObject = jest.fn();
const mockGetWidgetConfig = jest.fn();
const mockGetWindowObject = jest.fn();
const mockIsFlexibleWidth = jest.fn();
const mockGetHeading = jest.fn();
const mockHandleLinkClick = jest.fn();
const mockHandleKeyDownEvent = jest.fn();
const mockPrimeDispatchEvent = jest.fn();
const mockGetSkillsPageLink = jest.fn();
const mockIsSkillInterestViewUpdate = jest.fn();
const mockShowActionElement = jest.fn();

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@hooks', () => ({
  usePrimeStrip: (widget: any, account: any) => mockUsePrimeStrip(widget, account),
}));

jest.mock('@hooks/feedback', () => ({
  useFeedback: () => mockUseFeedback(),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string, returnKey?: boolean) => mockGetTranslation(key, returnKey),
}));

jest.mock('@utils/global', () => ({
  getALMConfig: () => mockGetALMConfig(),
  getALMObject: () => mockGetALMObject(),
  getWidgetConfig: () => mockGetWidgetConfig(),
  getWindowObject: () => mockGetWindowObject(),
  IsFlexibleWidth: () => mockIsFlexibleWidth(),
}));

jest.mock('@utils/widgets/utils', () => ({
  getHeading: (widget: any, account: any, searchString: string, options: any) =>
    mockGetHeading(widget, account, searchString, options),
  handleLinkClick: (event: any, link: string) => mockHandleLinkClick(event, link),
  handleKeyDownEvent: (event: any, link: string) => mockHandleKeyDownEvent(event, link),
  isPrimeLearningObject: (obj: any) => obj && obj.loType !== undefined,
  isSkillInterestViewUpdate: () => mockIsSkillInterestViewUpdate(),
  sliceArrayIntoChunks: (arr: any[], chunkSize: number) => {
    const chunks: any[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) chunks.push(arr.slice(i, i + chunkSize));
    return chunks;
  },
  BASE_AOI_STRIP_COUNT: 2,
  MAX_AOI_STRIP_COUNT: 10,
}));

jest.mock('@utils/widgets/base/EventHandlingBase', () => ({
  GetSkillsPageLink: () => mockGetSkillsPageLink(),
  PrimeDispatchEvent: (target: any, event: string, bubbles: boolean, detail?: any) =>
    mockPrimeDispatchEvent(target, event, bubbles, detail),
}));

jest.mock('@utils/inline_svg', () => ({
  LEFT_ARROW_SVG: () => <svg data-testid="left-arrow-svg" />,
  DOWN_ARROW_FILLED: () => <svg data-testid="down-arrow-svg" />,
  EMPTY_CARD_SVG: () => <svg data-testid="empty-card-svg" />,
  SEARCH_ICON_SVG: () => <svg data-testid="search-icon-svg" />,
}));

jest.mock('@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2', () => ({
  __esModule: true,
  default: ({ training }: any) => (
    <div data-testid={`training-card-${training.id}`}>{training.name}</div>
  ),
}));

jest.mock('@components/Widgets/ALMBrowseCatalog', () => ({
  ALMBrowseCatalog: ({ catalog }: any) => (
    <div data-testid={`browse-catalog-${catalog.id}`}>{catalog.name}</div>
  ),
}));

jest.mock('@components/ALMFeedback', () => ({
  PrimeFeedbackWrapper: () => <div data-testid="feedback-wrapper" />,
}));

jest.mock('@components/CustomPages/ALMWidgetLoader', () => ({
  ALMWidgetLoader: () => <div data-testid="widget-loader" />,
}));

jest.mock('@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper', () => ({
  handleLinkCLick: jest.fn(),
  canShowPrice: jest.fn(() => false),
  launchPlayerHandler: jest.fn(),
  openJobAid: jest.fn(),
}));

jest.mock('@components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper', () => ({
  getEmptyActionCardDetails: jest.fn(() => ({
    actionLink: '/catalog',
    actionHelpText: 'Browse catalog',
    actionText: 'Explore',
    actionLinkHeading: 'No items',
  })),
  isAnnouncementRecoUGWLinkEnable: jest.fn(() => false),
  showActionElement: (...args: any[]) => mockShowActionElement(...args),
  showAddToMyLearning: jest.fn(() => true),
  showAuthorInfo: jest.fn(() => false),
  showDontRecommend: jest.fn(() => false),
  showEffectivenessIndex: jest.fn(() => false),
  showNavIcons: jest.fn(() => true),
  showPRLInfo: jest.fn(() => false),
  showProgressBar: jest.fn(() => false),
  showRating: jest.fn(() => false),
  showRecommendedReason: jest.fn(() => false),
  showSkills: jest.fn(() => false),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAccount = {
  id: 'account-1',
  templatesConfig: JSON.stringify({ loCardConfig: {} }),
};

const mockUser = { id: 'user-1', name: 'Test User' };

// cardsToShow=5 → itemsPerPage=5; items.length must be >5 for right nav to be enabled.
const mockWidget = {
  id: 'widget-1',
  type: WidgetTypeNew.MYLEARNING,
  widgetRef: 'mylearning',
  attributes: { heading: 'My Learning', numberOfCardsLoaded: 0, isStripHidden: false },
  layoutAttributes: { id: 'my-learning-strip', cardsToShow: 5, isFullRow: true },
} as any;

const mockItems = [
  { id: 'lo-1', name: 'Course 1', loType: 'course' },
  { id: 'lo-2', name: 'Course 2', loType: 'course' },
  { id: 'lo-3', name: 'Course 3', loType: 'course' },
];

// 8 items ensures right nav is enabled (>cardsToShow=5) for nav arrow tests.
const manyItems = Array.from({ length: 8 }, (_, i) => ({
  id: `lo-${i}`,
  name: `Course ${i}`,
  loType: 'course',
}));

const makePrimeStripReturn = (overrides: any = {}) => ({
  fetchedAll: false,
  fetchingData: false,
  items: mockItems,
  maxStripCount: 0,
  skillName: '',
  fetchMore: jest.fn(),
  firstFetchDone: true,
  addBookmarkHandler: jest.fn(),
  removeBookmarkHandler: jest.fn(),
  removeItemFromList: jest.fn(),
  blockLORecommendationHandler: jest.fn(),
  unblockLORecommendationHandler: jest.fn(),
  enrollmentHandler: jest.fn(),
  updateLearningObject: jest.fn(),
  ...overrides,
});

const makeHeading = (overrides: any = {}) => ({
  name: 'My Learning',
  headerAriaLabel: 'My Learning',
  link: '/mylearning',
  seeAllLink: '/mylearning/all',
  headingClass: '',
  showAOIExploreLinks: false,
  ...overrides,
});

const renderComponent = (props: any = {}) =>
  render(<ALMPrimeStrip widget={mockWidget} account={mockAccount} user={mockUser} {...props} />);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ALMPrimeStrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // jsdom does not implement element.scrollTo; mock it so nav-arrow clicks don't throw.
    HTMLElement.prototype.scrollTo = jest.fn();

    mockGetTranslation.mockImplementation((key: string) => key);
    mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn());
    mockUseFeedback.mockReturnValue({
      feedbackTrainingId: '',
      trainingInstanceId: '',
      playerLaunchTimeStamp: 0,
      shouldLaunchFeedback: false,
      handleL1FeedbackLaunch: jest.fn(),
      fetchCurrentLo: jest.fn(),
      getFilteredNotificationForFeedback: jest.fn(),
      submitL1Feedback: jest.fn(),
      closeFeedbackWrapper: jest.fn(),
    });
    mockGetALMConfig.mockReturnValue({ _cardProperties: { height: 300, cardLayoutName: 'default' } });
    mockGetALMObject.mockReturnValue({ navigateToSkillsPage: jest.fn() });
    mockGetWidgetConfig.mockReturnValue({ isMobile: false });
    mockGetWindowObject.mockReturnValue({ innerWidth: 1200 });
    mockIsFlexibleWidth.mockReturnValue(false);
    mockGetHeading.mockReturnValue(makeHeading());
    mockGetSkillsPageLink.mockReturnValue('/skills');
    mockIsSkillInterestViewUpdate.mockReturnValue(false);
    mockShowActionElement.mockReturnValue(false);

    const helpers = require('@components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper');
    helpers.getEmptyActionCardDetails.mockReturnValue({
      actionLink: '/catalog',
      actionHelpText: 'Browse catalog',
      actionText: 'Explore',
      actionLinkHeading: 'No items',
    });
    helpers.isAnnouncementRecoUGWLinkEnable.mockReturnValue(false);
    helpers.showAuthorInfo.mockReturnValue(false);
    helpers.showDontRecommend.mockReturnValue(false);
    helpers.showEffectivenessIndex.mockReturnValue(false);
    helpers.showPRLInfo.mockReturnValue(false);
    helpers.showProgressBar.mockReturnValue(false);
    helpers.showRating.mockReturnValue(false);
    helpers.showRecommendedReason.mockReturnValue(false);
    helpers.showSkills.mockReturnValue(false);
    helpers.showAddToMyLearning.mockReturnValue(true);
    helpers.showNavIcons.mockReturnValue(true);

    const cardHelper = require('@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper');
    cardHelper.canShowPrice.mockReturnValue(false);
  });

  describe('Item Rendering', () => {
    it('nonCatalogWidget_items_trainingCardsRenderedForEachItem', () => {
      renderComponent();
      expect(screen.getByTestId('training-card-lo-1')).toBeInTheDocument();
      expect(screen.getByTestId('training-card-lo-2')).toBeInTheDocument();
      expect(screen.getByTestId('training-card-lo-3')).toBeInTheDocument();
    });

    it('catalogBrowserWidget_items_browseCatalogCardsRendered', () => {
      const catalogWidget = { ...mockWidget, type: WidgetTypeNew.CATALOG_BROWSER };
      const catalogs = [
        { id: 'cat-1', name: 'Catalog 1' },
        { id: 'cat-2', name: 'Catalog 2' },
      ];
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ items: catalogs }));
      renderComponent({ widget: catalogWidget });
      expect(screen.getByTestId('browse-catalog-cat-1')).toBeInTheDocument();
      expect(screen.getByTestId('browse-catalog-cat-2')).toBeInTheDocument();
      expect(screen.queryByTestId('training-card-cat-1')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('fetchingData_true_loaderShown', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ fetchingData: true }));
      renderComponent();
      expect(screen.getAllByTestId('widget-loader').length).toBeGreaterThan(0);
    });

    it('fetchingData_false_loaderHidden', () => {
      renderComponent();
      expect(screen.queryByTestId('widget-loader')).toBeNull();
    });
  });

  describe('Feedback Wrapper', () => {
    it('shouldLaunchFeedback_true_wrapperShown', () => {
      mockUseFeedback.mockReturnValue({
        feedbackTrainingId: 'lo-1',
        trainingInstanceId: 'inst-1',
        playerLaunchTimeStamp: 1000,
        shouldLaunchFeedback: true,
        handleL1FeedbackLaunch: jest.fn(),
        fetchCurrentLo: jest.fn(),
        getFilteredNotificationForFeedback: jest.fn(),
        submitL1Feedback: jest.fn(),
        closeFeedbackWrapper: jest.fn(),
      });
      renderComponent();
      expect(screen.getByTestId('feedback-wrapper')).toBeInTheDocument();
    });

    it('shouldLaunchFeedback_false_wrapperHidden', () => {
      renderComponent();
      expect(screen.queryByTestId('feedback-wrapper')).toBeNull();
    });
  });

  describe('Strip Visibility', () => {
    it('firstFetchDone_emptyItems_hideableWidget_sectionHidden', () => {
      const recoWidget = { ...mockWidget, type: WidgetTypeNew.RECOMMENDATIONS_STRIP };
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: [], firstFetchDone: true, fetchedAll: true })
      );
      const { container } = renderComponent({ widget: recoWidget });
      expect(container.querySelector('[role="region"]')?.getAttribute('style')).toContain('display: none');
    });

    it('firstFetchDone_emptyItems_nonHideableWidget_sectionVisible', () => {
      // MYLEARNING is not in the hideable list
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: [], firstFetchDone: true, fetchedAll: true })
      );
      const { container } = renderComponent();
      const style = container.querySelector('[role="region"]')?.getAttribute('style') ?? '';
      expect(style).not.toContain('display: none');
    });

    it('notFirstFetchDone_emptyItems_hideableWidget_sectionVisible', () => {
      const recoWidget = { ...mockWidget, type: WidgetTypeNew.RECOMMENDATIONS_STRIP };
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: [], firstFetchDone: false, fetchedAll: false })
      );
      const { container } = renderComponent({ widget: recoWidget });
      const style = container.querySelector('[role="region"]')?.getAttribute('style') ?? '';
      expect(style).not.toContain('display: none');
    });
  });

  describe('Navigation Arrows', () => {
    it('moreItemsThanPage_rightArrowPresent_leftArrowInitiallyDisabled', () => {
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: manyItems, fetchedAll: false })
      );
      const { container } = renderComponent();
      const leftArrow = container.querySelector('[data-automationid="cb-leftNav"]') as HTMLButtonElement;
      const rightArrow = container.querySelector('[data-automationid="cb-rightNav"]') as HTMLButtonElement;
      expect(leftArrow).not.toBeNull();
      expect(rightArrow).not.toBeNull();
      expect(leftArrow.disabled).toBe(true);
      expect(rightArrow.disabled).toBe(false);
    });

    it('fewerItemsThanPage_bothArrowsDisabled_navNotRendered', () => {
      // 3 items < cardsToShow=5 → both arrows disabled → getNavIcons returns null
      renderComponent();
      expect(
        document.querySelector('[data-automationid="cb-leftNav"]')
      ).toBeNull();
      expect(
        document.querySelector('[data-automationid="cb-rightNav"]')
      ).toBeNull();
    });

    it('rightNavClick_leftArrowBecomesEnabled', () => {
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: manyItems, fetchedAll: false })
      );
      const { container } = renderComponent();
      const leftArrow = container.querySelector('[data-automationid="cb-leftNav"]') as HTMLButtonElement;
      const rightArrow = container.querySelector('[data-automationid="cb-rightNav"]') as HTMLButtonElement;
      expect(leftArrow.disabled).toBe(true);
      fireEvent.click(rightArrow);
      expect(leftArrow.disabled).toBe(false);
    });
  });

  describe('Heading', () => {
    it('headingName_renderedInH2_withSkipLinkTarget', () => {
      const { container } = renderComponent();
      // heading.name rendered via dangerouslySetInnerHTML in the <a> inside <h2>
      expect(container.querySelector('h2')).not.toBeNull();
      expect(container.querySelector('[data-automationid="My Learning"]')).not.toBeNull();
      expect(
        container.querySelector('[data-skip-link-target="my-learning-strip"]')
      ).not.toBeNull();
    });

    it('seeAllLink_present_viewAllTextShown', () => {
      const { container } = renderComponent();
      // seeAllLink renders getStripLink with 'text.viewAll' key
      expect(container.querySelector('[id="cb-name-see-all"]')).not.toBeNull();
      expect(screen.getByText('text.viewAll')).toBeInTheDocument();
    });

    it('seeAllLink_absent_viewAllLinkNotRendered', () => {
      mockGetHeading.mockReturnValue(makeHeading({ seeAllLink: undefined }));
      renderComponent();
      expect(screen.queryByText('text.viewAll')).toBeNull();
    });

    it('heading_icon_renderedInHeader', () => {
      mockGetHeading.mockReturnValue(
        makeHeading({ icon: <div data-testid="custom-icon" /> })
      );
      renderComponent();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('heading_showNewTag_newTagTextRendered', () => {
      mockGetHeading.mockReturnValue(makeHeading({ showNewTag: true }));
      renderComponent();
      expect(screen.getByText('alm.text.new')).toBeInTheDocument();
    });

    it('heading_description_renderedInHeader', () => {
      mockGetHeading.mockReturnValue(makeHeading({ description: 'Learn something new' }));
      renderComponent();
      expect(screen.getByText('Learn something new')).toBeInTheDocument();
    });

    it('disableLinks_seeAllAndHeadingLinkCleared', () => {
      const widget = {
        ...mockWidget,
        attributes: { ...mockWidget.attributes, disableLinks: true },
      };
      // getHeading returns seeAllLink, but component clears it when disableLinks=true
      renderComponent({ widget });
      expect(screen.queryByText('text.viewAll')).toBeNull();
    });
  });

  describe('Header Skill Links', () => {
    it('showAOIExploreLinks_isSkillInterestViewUpdate_nonIndividualView_linksShown', () => {
      mockGetHeading.mockReturnValue(makeHeading({ showAOIExploreLinks: true }));
      mockIsSkillInterestViewUpdate.mockReturnValue(true);
      // widget.attributes.view is unset → satisfies (!view || view !== 'individual')
      renderComponent();
      expect(screen.getByText('lo.strip.view')).toBeInTheDocument();
      expect(screen.getByText('lo.strip.update')).toBeInTheDocument();
    });

    it('showAOIExploreLinks_individualView_linksHidden', () => {
      mockGetHeading.mockReturnValue(makeHeading({ showAOIExploreLinks: true }));
      mockIsSkillInterestViewUpdate.mockReturnValue(true);
      const widget = {
        ...mockWidget,
        attributes: { ...mockWidget.attributes, view: 'individual' },
      };
      renderComponent({ widget });
      expect(screen.queryByText('lo.strip.view')).toBeNull();
    });
  });

  describe('Heading Click', () => {
    it('headingNameClick_callsHandleLinkClick', () => {
      const { container } = renderComponent();
      const headingLink = container.querySelector('[data-automationid="My Learning"]')!;
      fireEvent.click(headingLink);
      expect(mockHandleLinkClick).toHaveBeenCalledWith(expect.anything(), '/mylearning');
    });
  });

  describe('AOI Footer', () => {
    const makeAoiWidget = (stripNum: number) => ({
      ...mockWidget,
      attributes: { ...mockWidget.attributes, stripNum },
    });

    it('stripNum2_aoiCount0_maxGt2_viewMoreButtonShown', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ maxStripCount: 5 }));
      mockGetHeading.mockReturnValue(makeHeading({ showAOIExploreLinks: true }));
      renderComponent({ widget: makeAoiWidget(2), aoiStripCount: 0 });
      expect(
        document.querySelector('[data-automationid="primelxp-aoi-strip-showmore-button"]')
      ).not.toBeNull();
    });

    it('stripNum2_aoiCount0_maxLe2_viewMoreButtonHidden', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ maxStripCount: 2 }));
      mockGetHeading.mockReturnValue(makeHeading({ showAOIExploreLinks: true }));
      renderComponent({ widget: makeAoiWidget(2), aoiStripCount: 0 });
      expect(
        document.querySelector('[data-automationid="primelxp-aoi-strip-showmore-button"]')
      ).toBeNull();
    });

    it('viewMoreButtonClick_dispatchesLoadExtraStripsEvent', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ maxStripCount: 5 }));
      mockGetHeading.mockReturnValue(makeHeading({ showAOIExploreLinks: true }));
      renderComponent({ widget: makeAoiWidget(2), aoiStripCount: 0 });
      const btn = document.querySelector(
        '[data-automationid="primelxp-aoi-strip-showmore-button"]'
      )!;
      fireEvent.click(btn);
      expect(mockPrimeDispatchEvent).toHaveBeenCalledTimes(1);
      expect(mockPrimeDispatchEvent).toHaveBeenCalledWith(
        document,
        expect.stringContaining('LOAD_EXTRA_STRIPS'),
        false,
        { maxStripCount: 5 }
      );
    });

    it('stripGt2_aoiCountGt0_isSkillInterestViewUpdate_footerSkillLinksShown', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ maxStripCount: 10 }));
      mockIsSkillInterestViewUpdate.mockReturnValue(true);
      renderComponent({ widget: makeAoiWidget(10), aoiStripCount: 1 });
      // Footer skill links use data-automationid (not id like header links)
      expect(
        document.querySelector('[data-automationid="primelxp-view-skills"]')
      ).not.toBeNull();
      expect(
        document.querySelector('[data-automationid="primelxp-update-skills"]')
      ).not.toBeNull();
    });
  });

  describe('Widget Attribute Mutations', () => {
    it('numberOfCardsLoaded_setToItemsLengthOnRender', () => {
      const widget = {
        ...mockWidget,
        attributes: { ...mockWidget.attributes, numberOfCardsLoaded: 0 },
      };
      renderComponent({ widget });
      expect(widget.attributes.numberOfCardsLoaded).toBe(3);
    });

    it('isStripHidden_setTrueWhenHideableWidgetHasNoItems', () => {
      const recoWidget = {
        ...mockWidget,
        type: WidgetTypeNew.RECOMMENDATIONS_STRIP,
        attributes: { ...mockWidget.attributes, isStripHidden: false },
      };
      mockUsePrimeStrip.mockReturnValue(
        makePrimeStripReturn({ items: [], firstFetchDone: true })
      );
      renderComponent({ widget: recoWidget });
      expect(recoWidget.attributes.isStripHidden).toBe(true);
    });
  });

  describe('usePrimeStrip Integration', () => {
    it('usePrimeStrip_calledWithWidgetAndAccount', () => {
      renderComponent();
      expect(mockUsePrimeStrip).toHaveBeenCalledWith(mockWidget, mockAccount);
    });

    it('skillName_present_getHeadingCalledWithSkillName', () => {
      mockUsePrimeStrip.mockReturnValue(makePrimeStripReturn({ skillName: 'JavaScript' }));
      renderComponent();
      expect(mockGetHeading).toHaveBeenCalledWith(
        mockWidget,
        mockAccount,
        '',
        expect.objectContaining({ skillName: 'JavaScript' })
      );
    });
  });
});
