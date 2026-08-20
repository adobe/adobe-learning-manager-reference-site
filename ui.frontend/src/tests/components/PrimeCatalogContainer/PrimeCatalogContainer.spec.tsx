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
jest.mock('@contextProviders/userContextProvider', () => ({
  UserContextProvider: ({ children }: any) => children,
  useUserContext: jest.fn(),
}));

jest.mock('../../../index', () => ({
  reducer: jest.fn((state = {}) => state),
}));

jest.mock('@hooks/catalog/useCatalog', () => ({
  useCatalog: jest.fn(),
}));

jest.mock('@hooks/useJobAids', () => ({
  useJobAids: jest.fn(),
}));

jest.mock('@components/Catalog/PrimeCatalogFilters', () => ({
  PrimeCatalogFilters: () => <div data-testid="catalog-filters" />,
}));

jest.mock('@components/Catalog/PrimeCatalogSearch/PrimeCatalogSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="catalog-search" />,
}));

jest.mock('@components/Catalog/PrimeTrainingsContainer', () => ({
  PrimeTrainingsContainer: () => <div data-testid="trainings-container" />,
}));

jest.mock('@components/Catalog/PrimeCatalogFilters/PrimeSelectedFiltersList', () => ({
  __esModule: true,
  default: () => <div data-testid="selected-filters-list" />,
}));

jest.mock('@components/Common/ALMLoader', () => ({
  ALMLoader: () => <div data-testid="alm-loader" />,
}));

jest.mock('@components/ALMGoToTop', () => ({
  ALMGoToTop: () => null,
}));

jest.mock('@components/Common/ALMErrorBoundary', () => ({
  ALMErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock('@components/Common/ALMCustomPicker', () => ({
  ALMCustomPicker: () => <div data-testid="custom-picker" />,
}));

jest.mock('@components/ALMDialog', () => ({
  ALMDialog: ({ children }: any) => <div data-testid="alm-dialog">{children}</div>,
  ALMDialogHeader: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(),
  GetTranslationReplaced: jest.fn(),
  GetTranslationsReplaced: jest.fn(),
  isTranslated: jest.fn(),
}));

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMObject: jest.fn(),
  getALMUser: jest.fn(),
  getQueryParamsFromUrl: jest.fn(),
  getSelectedOptionsForMobile: jest.fn(),
  setTrainingsLayout: jest.fn(),
  updateURLParams: jest.fn(),
  GetPrimeEmitEventLinks: jest.fn(() => []),
  getWindowObject: () => globalThis,
  canShowExternalLearning: jest.fn(() => false),
}));

jest.mock('@utils/inline_svg', () => ({
  CLOSE_SVG: () => <svg data-testid="close-icon" />,
  EXTERNAL_LEARNING_ICON: () => <svg data-testid="external-learning-icon" />,
}));

jest.mock('@utils/catalog', () => ({
  getInitialView: jest.fn(),
  splitStringIntoArray: jest.fn(),
  debounce: (fn: Function) => fn,
  isMyLearningPage: jest.fn(() => false),
}));

jest.mock('@utils/filters', () => ({
  getFilterLabel: jest.fn(),
}));

jest.mock('@utils/sort', () => ({
  getAvailableSortOptions: jest.fn(),
}));

jest.mock('../../../almLib/store', () => ({
  updateSortOrder: jest.fn((s: string) => ({ type: 'UPDATE_SORT_ORDER', payload: s })),
}));

jest.mock('@almStore/actions/search/actions', () => ({
  closeSuggestionsList: jest.fn(() => ({ type: 'CLOSE_SUGGESTIONS_LIST' })),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PrimeCatalogContainer from '@components/Catalog/PrimeCatalogContainer/PrimeCatalogContainer';
import { useUserContext } from '@contextProviders/userContextProvider';
import { useCatalog } from '@hooks/catalog/useCatalog';
import { useJobAids } from '@hooks/useJobAids';
import { GetTranslation, GetTranslationReplaced, isTranslated } from '@utils/translationService';
import {
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  getSelectedOptionsForMobile,
  setTrainingsLayout,
  canShowExternalLearning,
} from '@utils/global';
import { getInitialView, isMyLearningPage, splitStringIntoArray } from '@utils/catalog';
import { getAvailableSortOptions } from '@utils/sort';
import { getFilterLabel } from '@utils/filters';
import { DeviceTypeProvider } from '@contextProviders/DeviceContextProvider';
import { DialogProvider } from '@contextProviders/ALMDialogContextProvider';
import { withProviders } from '../../common/hoc';
import store from '../../../store/APIStore';

const mockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;
const mockUseCatalog = useCatalog as jest.MockedFunction<typeof useCatalog>;
const mockUseJobAids = useJobAids as jest.MockedFunction<typeof useJobAids>;
const mockGetALMConfig = getALMConfig as jest.MockedFunction<typeof getALMConfig>;
const mockGetALMObject = getALMObject as jest.MockedFunction<typeof getALMObject>;
const mockGetQueryParamsFromUrl = getQueryParamsFromUrl as jest.MockedFunction<typeof getQueryParamsFromUrl>;
const mockGetInitialView = getInitialView as jest.MockedFunction<typeof getInitialView>;
const mockGetAvailableSortOptions = getAvailableSortOptions as jest.MockedFunction<typeof getAvailableSortOptions>;
const mockSetTrainingsLayout = setTrainingsLayout as jest.MockedFunction<typeof setTrainingsLayout>;

const mockUser = {
  id: 'user123',
  name: 'Test User',
  account: { id: 'account123', viewType: 'LIST_VIEW' },
} as any;

const defaultProps = {
  heading: 'Test Catalog',
  description: 'Test catalog description',
  guest: false,
  signUpURL: '',
  almDomain: 'test.example.com',
};

const baseCatalogReturn = {
  trainings: [],
  loadMoreTraining: jest.fn(),
  query: '',
  handleSearch: jest.fn(),
  resetSearch: jest.fn(),
  getSearchSuggestions: jest.fn(),
  filterState: {},
  updateFilters: jest.fn(),
  catalogAttributes: { showFilters: 'true', showSearch: 'true' },
  isLoading: false,
  hasMoreItems: false,
  updatePriceRangeFilter: jest.fn(),
  updateSnippet: jest.fn(),
  enrollmentHandler: jest.fn(),
  updateLearningObject: jest.fn(),
  resetFilterList: jest.fn(),
  metaData: {},
  areFiltersLoading: false,
  searchFilters: jest.fn(),
  clearFilterSearch: jest.fn(),
  autoCorrectMode: false,
  removeTrainingFromListById: jest.fn(),
  updateFilterList: jest.fn(),
  addBookmarkHandler: jest.fn(),
  removeBookmarkHandler: jest.fn(),
  hydrateSelectedCatalogs: jest.fn(),
};

const renderCatalog = (
  props: any = {},
  device: 'desktop' | 'mobile' | 'tablet' = 'desktop',
  user: any = mockUser
) => {
  const widths = { desktop: 1200, tablet: 800, mobile: 400 };
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: widths[device],
  });
  mockUseUserContext.mockReturnValue({ user, setUser: jest.fn() } as any);

  const Comp = () => (
    <DeviceTypeProvider>
      <DialogProvider>
        <PrimeCatalogContainer {...defaultProps} {...props} />
      </DialogProvider>
    </DeviceTypeProvider>
  );
  return render(withProviders(Comp, {}));
};

describe('PrimeCatalogContainer', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);

    (GetTranslation as jest.Mock).mockImplementation((key: string) => key);
    (GetTranslationReplaced as jest.Mock).mockImplementation((key: string, value: any) => `${key} ${value}`);
    (isTranslated as jest.Mock).mockReturnValue(true);

    mockGetALMConfig.mockReturnValue({
      hideSearchInput: false,
      hideSearchClearButton: false,
      learnerMobileApp: false,
    } as any);
    mockGetALMObject.mockReturnValue({
      navigateToSocial: jest.fn(),
      isPrimeUserLoggedIn: jest.fn(() => false),
    } as any);
    mockGetQueryParamsFromUrl.mockReturnValue({} as any);
    (getSelectedOptionsForMobile as jest.Mock).mockReturnValue({});
    mockSetTrainingsLayout.mockImplementation((view: string, setView: Function) => setView(view));

    mockGetInitialView.mockReturnValue('LIST_VIEW' as any);
    (splitStringIntoArray as jest.Mock).mockImplementation((s: string) => (s ? s.split(',') : []));
    (getFilterLabel as jest.Mock).mockReturnValue({ label: '', labelToShow: '' });
    mockGetAvailableSortOptions.mockReturnValue({
      availableSortOptions: [{ id: 'name', name: 'Name' }, { id: 'date', name: 'Date' }],
      defaultOption: 'name',
    } as any);

    jest.spyOn(store, 'getState').mockReturnValue({
      catalog: { sort: 'name', filterState: {}, selectedCatalogs: {} },
    } as any);

    mockUseCatalog.mockReturnValue(baseCatalogReturn as any);
    mockUseJobAids.mockReturnValue({ launchJobAid: jest.fn() } as any);
    mockUseUserContext.mockReturnValue({ user: mockUser, setUser: jest.fn() } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Page heading', () => {
    it('renders props.heading as an H1 element', () => {
      renderCatalog();
      expect(screen.getByText('Test Catalog').tagName).toBe('H1');
    });

    it('falls back to the translated default heading when heading prop is absent', () => {
      renderCatalog({ heading: undefined });
      expect(screen.getByText('alm.catalog.header').tagName).toBe('H1');
    });

    it('shows search results translation key as heading when query is present', () => {
      mockUseCatalog.mockReturnValue({ ...baseCatalogReturn, query: 'React', metaData: { formalCount: 5 } } as any);
      renderCatalog();
      expect(screen.getByText(/alm.search.results.text/)).not.toBeNull();
    });

    it('shows the search query in quotes when formalCount is defined', () => {
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'React Testing',
        metaData: { formalCount: 10, correctedQuery: '' },
      } as any);
      renderCatalog();
      expect(screen.getByText('"React Testing"')).not.toBeNull();
    });

    it('shows the corrected query in quotes when correctedQuery is present', () => {
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'Reakt',
        metaData: { formalCount: 10, correctedQuery: 'React' },
      } as any);
      renderCatalog();
      expect(screen.getByText('"React"')).not.toBeNull();
    });
  });

  describe('Description', () => {
    it('renders props.description when no search query is active', () => {
      renderCatalog();
      expect(screen.getByText('Test catalog description')).not.toBeNull();
    });

    it('hides description when a search query is active', () => {
      mockUseCatalog.mockReturnValue({ ...baseCatalogReturn, query: 'React', metaData: { formalCount: 5 } } as any);
      renderCatalog();
      expect(screen.queryByText('Test catalog description')).not.toBeInTheDocument();
    });
  });

  describe('Search component', () => {
    it('renders catalog-search when showSearch is "true"', () => {
      renderCatalog();
      expect(screen.getByTestId('catalog-search')).not.toBeNull();
    });

    it('hides catalog-search when showSearch is "false"', () => {
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn,
        catalogAttributes: { showSearch: 'false', showFilters: 'true' },
      } as any);
      renderCatalog();
      expect(screen.queryByTestId('catalog-search')).not.toBeInTheDocument();
    });

    it('hides the search container when hideSearchInput config is true', () => {
      mockGetALMConfig.mockReturnValue({ hideSearchInput: true, hideSearchClearButton: false, learnerMobileApp: false } as any);
      const { container } = renderCatalog();
      expect(container.querySelector('[data-automationid="catalogSearchContainer"]')).not.toBeInTheDocument();
    });

    it('calls resetSearch when the clear button is clicked', () => {
      const resetSearch = jest.fn();
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'React', resetSearch, metaData: { formalCount: 5 },
      } as any);
      const { container } = renderCatalog();
      userEvent.click(container.querySelector('[data-automationid="closeSearch"]') as HTMLElement);
      expect(resetSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Social learning results link', () => {
    it('calls navigateToSocial with the search URL when the social link is clicked', () => {
      const navigateToSocial = jest.fn();
      mockGetALMObject.mockReturnValue({ navigateToSocial, isPrimeUserLoggedIn: jest.fn(() => false) } as any);
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'React',
        metaData: { formalCount: 5, informalCount: 3 },
      } as any);
      const { container } = renderCatalog();
      userEvent.click(container.querySelector('[data-automationid="search-social-link"]') as HTMLElement);
      expect(navigateToSocial).toHaveBeenCalledWith('/search?searchString=React');
    });

    it('hides the social link when learnerMobileApp is true', () => {
      mockGetALMConfig.mockReturnValue({ hideSearchInput: false, hideSearchClearButton: false, learnerMobileApp: true } as any);
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'React',
        metaData: { formalCount: 5, informalCount: 3 },
      } as any);
      const { container } = renderCatalog();
      expect(container.querySelector('[data-automationid="search-social-link"]')).not.toBeInTheDocument();
    });
  });

  describe('Autocorrect', () => {
    it('calls handleSearch(originalQuery, false) when the original query link is clicked', () => {
      const handleSearch = jest.fn();
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn, query: 'Reakt', handleSearch,
        metaData: { formalCount: 5, correctedQuery: 'React' },
      } as any);
      renderCatalog();
      const autocorrectLink = screen.getAllByRole('link').find(l => l.textContent?.includes('Reakt'));
      expect(autocorrectLink).not.toBeUndefined();
      userEvent.click(autocorrectLink!);
      expect(handleSearch).toHaveBeenCalledWith('Reakt', false);
    });
  });

  describe('Filters panel', () => {
    it('renders catalog-filters when showFilters is "true"', () => {
      renderCatalog();
      expect(screen.getByTestId('catalog-filters')).not.toBeNull();
    });

    it('hides catalog-filters when showFilters is "false"', () => {
      mockUseCatalog.mockReturnValue({
        ...baseCatalogReturn,
        catalogAttributes: { showSearch: 'true', showFilters: 'false' },
      } as any);
      renderCatalog();
      expect(screen.queryByTestId('catalog-filters')).not.toBeInTheDocument();
    });

    it('renders selected-filters-list on desktop', () => {
      renderCatalog({}, 'desktop');
      expect(screen.getByTestId('selected-filters-list')).not.toBeNull();
    });

    it('hides selected-filters-list on mobile', () => {
      renderCatalog({}, 'mobile');
      expect(screen.queryByTestId('selected-filters-list')).not.toBeInTheDocument();
    });
  });

  describe('Trainings container', () => {
    it('renders trainings-container when user is present', () => {
      renderCatalog();
      expect(screen.getByTestId('trainings-container')).not.toBeNull();
    });

    it('hides trainings-container when user is null', () => {
      renderCatalog({}, 'desktop', null);
      expect(screen.queryByTestId('trainings-container')).not.toBeInTheDocument();
    });
  });

  describe('Loading indicator', () => {
    it('renders alm-loader when isLoading is true', () => {
      mockUseCatalog.mockReturnValue({ ...baseCatalogReturn, isLoading: true } as any);
      renderCatalog();
      expect(screen.getByTestId('alm-loader')).not.toBeNull();
    });

    it('hides alm-loader when isLoading is false', () => {
      renderCatalog();
      expect(screen.queryByTestId('alm-loader')).not.toBeInTheDocument();
    });
  });

  describe('View toggle buttons', () => {
    it('list button starts with aria-pressed=true when initial view is LIST_VIEW', () => {
      const { container } = renderCatalog();
      expect(container.querySelector('[data-automationid="trainingsListView"]')!.getAttribute('aria-pressed')).toBe('true');
      expect(container.querySelector('[data-automationid="trainingsTileView"]')!.getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking tile button calls setTrainingsLayout("TILE_VIEW") and flips aria-pressed', () => {
      const { container } = renderCatalog();
      userEvent.click(container.querySelector('[data-automationid="trainingsTileView"]') as HTMLElement);
      expect(mockSetTrainingsLayout).toHaveBeenCalledWith('TILE_VIEW', expect.any(Function));
      expect(container.querySelector('[data-automationid="trainingsTileView"]')!.getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking list button calls setTrainingsLayout("LIST_VIEW")', () => {
      mockGetInitialView.mockReturnValue('TILE_VIEW' as any);
      const { container } = renderCatalog();
      userEvent.click(container.querySelector('[data-automationid="trainingsListView"]') as HTMLElement);
      expect(mockSetTrainingsLayout).toHaveBeenCalledWith('LIST_VIEW', expect.any(Function));
    });
  });

  describe('Sort', () => {
    it('renders ALMCustomPicker on desktop', () => {
      renderCatalog({}, 'desktop');
      expect(screen.getByTestId('custom-picker')).not.toBeNull();
    });

    it('renders sort button with aria-label on mobile', () => {
      renderCatalog({}, 'mobile');
      expect(screen.getByLabelText('alm.picker.sortBy').tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Mobile dialogs', () => {
    const mockDialogContext = (overrides: any = {}) => {
      const ctx = { openDialog: jest.fn(), closeDialog: jest.fn(), isOpen: jest.fn(() => false), ...overrides };
      jest.spyOn(require('@contextProviders/ALMDialogContextProvider'), 'useDialog').mockReturnValue(ctx);
      return ctx;
    };

    it('calls openDialog("alm-sort-dialog") when sort button is clicked', () => {
      const ctx = mockDialogContext();
      renderCatalog({}, 'mobile');
      userEvent.click(screen.getByLabelText('alm.picker.sortBy'));
      expect(ctx.openDialog).toHaveBeenCalledWith('alm-sort-dialog');
    });

    it('calls openDialog("alm-filters-dialog") when filter button is clicked', () => {
      const ctx = mockDialogContext();
      const { container } = renderCatalog({}, 'mobile');
      userEvent.click(container.querySelector('[aria-label="Filters"]') as HTMLElement);
      expect(ctx.openDialog).toHaveBeenCalledWith('alm-filters-dialog');
    });

    it('renders sort dialog content when alm-sort-dialog is open', () => {
      mockDialogContext({ isOpen: (id: string) => id === 'alm-sort-dialog' });
      renderCatalog({}, 'mobile');
      expect(screen.getByTestId('alm-dialog')).not.toBeNull();
      expect(screen.getByText('alm.community.board.sortBy')).not.toBeNull();
    });
  });

  describe('Mount effects', () => {
    it('calls hydrateSelectedCatalogs on mount', () => {
      const hydrateSelectedCatalogs = jest.fn();
      mockUseCatalog.mockReturnValue({ ...baseCatalogReturn, hydrateSelectedCatalogs } as any);
      renderCatalog();
      expect(hydrateSelectedCatalogs).toHaveBeenCalledTimes(1);
    });

    it('dispatches on mount to set the default sort option', () => {
      renderCatalog();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('resets the sort to the context default when the stored sort is invalid for the context', () => {
      // Stored 'relevance' is not among the available (catalog) options -> must be reset
      jest.spyOn(store, 'getState').mockReturnValue({
        catalog: { sort: 'relevance', filterState: {}, selectedCatalogs: {} },
      } as any);
      mockGetAvailableSortOptions.mockReturnValue({
        availableSortOptions: [
          { id: 'name', name: 'Name' },
          { id: 'date', name: 'Date' },
        ],
        defaultOption: 'name',
      } as any);

      renderCatalog();

      // Mount effect dispatches the sort once; because the stored 'relevance' isn't a
      // valid option here, the re-sync effect dispatches a second time to reset it.
      // (A sort valid for the context would leave it at a single mount dispatch.)
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Focus handler', () => {
    it('dispatches closeSuggestionsList when the filters-and-list area receives focus', () => {
      const { container } = renderCatalog();
      mockDispatch.mockClear();
      fireEvent.focusIn(container.querySelector('[data-automationid="catalogFiltersAndListContainer"]') as HTMLElement);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Sort and layout position (desktop)', () => {
    it('sort picker is inside catalogTrainingsContainer on desktop', () => {
      const { container } = renderCatalog({}, 'desktop');
      const trainingsContainer = container.querySelector('[data-automationid="catalogTrainingsContainer"]');
      expect(trainingsContainer?.querySelector('[data-automationid="sortType"]')).not.toBeNull();
    });

    it('view toggle buttons are inside catalogTrainingsContainer on desktop', () => {
      const { container } = renderCatalog({}, 'desktop');
      const trainingsContainer = container.querySelector('[data-automationid="catalogTrainingsContainer"]');
      expect(trainingsContainer?.querySelector('[data-automationid="trainingsTileView"]')).not.toBeNull();
      expect(trainingsContainer?.querySelector('[data-automationid="trainingsListView"]')).not.toBeNull();
    });

    it('sort picker is not inside catalogTrainingsContainer on mobile', () => {
      const { container } = renderCatalog({}, 'mobile');
      const trainingsContainer = container.querySelector('[data-automationid="catalogTrainingsContainer"]');
      expect(trainingsContainer?.querySelector('[data-automationid="sortType"]')).toBeNull();
    });

    it('sort picker is not inside catalogDescription area on desktop', () => {
      const { container } = renderCatalog({}, 'desktop');
      const descriptionDiv = container.querySelector('[data-automationid="catalogDescription"]');
      // sort was previously a sibling of catalogDescription — it must no longer be in that area
      const descParent = descriptionDiv?.parentElement;
      expect(descParent?.querySelector('[data-automationid="sortType"]')).toBeNull();
    });
  });

  describe('Description HTML rendering', () => {
    it('renders HTML tags inside a string description', () => {
      const { container } = renderCatalog({ description: 'Navigate to <b>External Learning</b> here' });
      expect(container.querySelector('b')?.textContent).toBe('External Learning');
    });

    it('renders plain text string description without escaping', () => {
      renderCatalog({ description: 'Plain text catalog description' });
      expect(screen.getByText('Plain text catalog description')).toBeInTheDocument();
    });
  });

  describe('External Learning button placement', () => {
    beforeEach(() => {
      (isMyLearningPage as jest.Mock).mockReturnValue(true);
      (canShowExternalLearning as jest.Mock).mockReturnValue(true);
      mockGetALMObject.mockReturnValue({
        navigateToSocial: jest.fn(),
        navigateToExternalLearningPage: jest.fn(),
        isPrimeUserLoggedIn: jest.fn(() => false),
      } as any);
    });

    it('renders external learning button on desktop', () => {
      renderCatalog({}, 'desktop');
      expect(screen.getByTestId('external-learning-icon')).toBeInTheDocument();
    });

    it('external learning button is inside descriptionContainer not catalogTrainingsContainer on desktop', () => {
      const { container } = renderCatalog({}, 'desktop');
      const trainingsContainer = container.querySelector('[data-automationid="catalogTrainingsContainer"]');
      // the button contains the icon — it must not be inside the trainings container
      expect(trainingsContainer?.querySelector('[data-testid="external-learning-icon"]')).toBeNull();
      // but it must exist somewhere on the page
      expect(screen.getByTestId('external-learning-icon')).toBeInTheDocument();
    });

    it('external learning button is a sibling of catalogDescription on desktop', () => {
      const { container } = renderCatalog({}, 'desktop');
      const descriptionDiv = container.querySelector('[data-automationid="catalogDescription"]');
      const descParent = descriptionDiv?.parentElement;
      expect(descParent?.querySelector('[data-testid="external-learning-icon"]')).not.toBeNull();
    });

    it('clicking external learning button calls navigateToExternalLearningPage', () => {
      const navigateToExternalLearningPage = jest.fn();
      mockGetALMObject.mockReturnValue({
        navigateToSocial: jest.fn(),
        navigateToExternalLearningPage,
        isPrimeUserLoggedIn: jest.fn(() => false),
      } as any);
      renderCatalog({}, 'desktop');
      userEvent.click(screen.getByTestId('external-learning-icon').closest('button')!);
      expect(navigateToExternalLearningPage).toHaveBeenCalledTimes(1);
    });

    it('does not render desktop external learning button on mobile', () => {
      renderCatalog({}, 'mobile');
      // on mobile the button is in mobileExternalLearning, not as a sibling of catalogDescription
      const descriptionDiv = screen.queryByTestId('external-learning-icon')
        ?.closest('[data-automationid="catalogDescription"]');
      expect(descriptionDiv).toBeNull();
    });
  });
});
