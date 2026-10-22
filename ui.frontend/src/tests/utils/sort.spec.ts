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
jest.mock('@almLib/utils/catalog', () => ({
  getSearchOrCatalog: jest.fn(() => 'catalog'),
  isMyLearningPage: jest.fn(() => false),
}));
jest.mock('@almLib/utils/global', () => ({
  getALMConfig: jest.fn(() => ({ effectivenessDataConfig: '', guest: false })),
  getALMObject: jest.fn(() => ({ isPrimeUserLoggedIn: jest.fn(() => true) })),
  getQueryParamsFromUrl: jest.fn(() => ({})),
}));
jest.mock('@almLib/utils/translationService', () => ({
  GetTranslation: jest.fn(k => k),
}));

import { allSortOptions, getAvailableSortOptions } from '@almLib/utils/sort';
import { GetTranslation } from '@almLib/utils/translationService';
import { getSearchOrCatalog, isMyLearningPage } from '@almLib/utils/catalog';
import { getALMConfig, getALMObject, getQueryParamsFromUrl } from '@almLib/utils/global';

describe('sort', () => {
  beforeEach(() => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('catalog');
    (isMyLearningPage as jest.Mock).mockReturnValue(false);
    (GetTranslation as jest.Mock).mockClear();
    (GetTranslation as jest.Mock).mockImplementation((k: string) => k);
    (getALMConfig as jest.Mock).mockReturnValue({ effectivenessDataConfig: '', guest: false });
    (getALMObject as jest.Mock).mockReturnValue({ isPrimeUserLoggedIn: jest.fn(() => true) });
    (getQueryParamsFromUrl as jest.Mock).mockReturnValue({});
  });

  it('allSortOptions', () => {
    const options = allSortOptions(GetTranslation);
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it('getAvailableSortOptions', () => {
    const account = {
      prlCriteria: { enabled: false },
      recommendationAccountType: '',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);
    expect(Array.isArray(result.availableSortOptions)).toBe(true);
    expect(result.defaultOption).toBe('-date');
  });

  it('should use myLearning sort config when on myLearning page', () => {
    (isMyLearningPage as jest.Mock).mockReturnValue(true);
    const account = {
      prlCriteria: { enabled: false },
      recommendationAccountType: '',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    // Line 98 - should use myLearning config; myLearning default is dueDate
    expect(Array.isArray(result.availableSortOptions)).toBe(true);
    expect(result.defaultOption).toBe('dueDate');
  });

  it('should use most recommended as default when isMostRecommendedDefault is true in catalog', () => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('catalog');
    (isMyLearningPage as jest.Mock).mockReturnValue(false);

    const account = {
      prlCriteria: { enabled: true },
      recommendationAccountType: 'CPE_NEW',
      learnerLayout: 'MOST_RECOMMENDED_DEFAULT',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    // Line 104 - should set defaultOption to SORT_MOST_RECOMMENDED_PARAM
    expect(result.defaultOption).toBe('-recommendationScore'); // Actual value returned
  });

  it('should handle search page configuration', () => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('search');
    (isMyLearningPage as jest.Mock).mockReturnValue(false);

    const account = {
      prlCriteria: { enabled: false },
      recommendationAccountType: '',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    // search page default is relevance
    expect(Array.isArray(result.availableSortOptions)).toBe(true);
    expect(result.defaultOption).toBe('relevance');
  });

  it('should ignore a catalog-only URL sort (recommendationScore) in search and fall back to relevance', () => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('search');
    (getQueryParamsFromUrl as jest.Mock).mockReturnValue({ sort: '-recommendationScore' });

    const account = {
      prlCriteria: { enabled: true },
      recommendationAccountType: 'CPE_NEW',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    expect(result.defaultOption).toBe('relevance');
  });

  it('should ignore a search-only URL sort (relevance) in catalog and fall back to the catalog default', () => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('catalog');
    (getQueryParamsFromUrl as jest.Mock).mockReturnValue({ sort: 'relevance' });

    const account = {
      prlCriteria: { enabled: false },
      recommendationAccountType: '',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    expect(result.defaultOption).toBe('-date');
  });

  it('should honor a URL sort that is valid for the current context', () => {
    (getSearchOrCatalog as jest.Mock).mockReturnValue('search');
    (getQueryParamsFromUrl as jest.Mock).mockReturnValue({ sort: '-date' });

    const account = {
      prlCriteria: { enabled: false },
      recommendationAccountType: '',
      learnerLayout: '',
    } as any;
    const result = getAvailableSortOptions(account, GetTranslation);

    // '-date' is a valid search option, so the URL value wins over the default
    expect(result.defaultOption).toBe('-date');
  });
});
