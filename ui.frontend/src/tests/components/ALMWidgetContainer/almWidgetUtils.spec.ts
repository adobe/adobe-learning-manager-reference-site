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
import { handleCommaSeparatedValues } from '@components/ALMWidgetContainer/almWidgetUtils';
import { WidgetType } from '@utils/widgets/common';

describe('handleCommaSeparatedValues', () => {
  it('splits sourceDetails for Courses and Paths into a trimmed list', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, {
      sourceDetails: 'catalog:1, catalog:2 ,catalog:3',
    });

    expect(result.sourceDetails).toEqual(['catalog:1', 'catalog:2', 'catalog:3']);
  });

  it('turns a single saved sourceDetails value into a one-item list', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, {
      sourceDetails: 'Sales',
    });

    expect(result.sourceDetails).toEqual(['Sales']);
  });

  it('turns an empty sourceDetails string into an empty list', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, {
      sourceDetails: '',
    });

    expect(result.sourceDetails).toEqual([]);
  });

  it('still splits loIds, loTypes and sourceIds', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, {
      loIds: 'course:1, course:2',
      loTypes: 'course, jobAid',
      sourceIds: '1, 2',
    });

    expect(result.loIds).toEqual(['course:1', 'course:2']);
    expect(result.loTypes).toEqual(['course', 'jobAid']);
    expect(result.sourceIds).toEqual(['1', '2']);
  });

  it('splits the Courses and Paths filter lists', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, {
      learnerState: 'enrolled, started',
      preferredSortPartitionOrder: 'started, enrolled',
      tagName: 'a, b',
    });

    expect(result.learnerState).toEqual(['enrolled', 'started']);
    expect(result.preferredSortPartitionOrder).toEqual(['started', 'enrolled']);
    expect(result.tagName).toEqual(['a', 'b']);
  });

  it('keeps the sort as a single string', () => {
    const result = handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, { sort: '-name' });

    expect(result.sort).toBe('-name');
  });

  it('does not split sourceDetails for other widgets', () => {
    const result = handleCommaSeparatedValues(WidgetType.CATEGORY, {
      sourceDetails: 'Sales, Marketing',
    });

    expect(result.sourceDetails).toBe('Sales, Marketing');
  });

  it('does not mutate the input attributes', () => {
    const attributes = { sourceDetails: 'a, b' };
    handleCommaSeparatedValues(WidgetType.COURSES_AND_PATHS, attributes);

    expect(attributes.sourceDetails).toBe('a, b');
  });
});
