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

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExternalLearningBreadcrumb from '@components/ExternalLearning/ExternalLearningBreadcrumb';
import * as translationService from '@utils/translationService';

const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<
  typeof translationService.GetTranslation
>;

beforeEach(() => {
  mockGetTranslation.mockImplementation((key: string) => key);
});

describe('ExternalLearningBreadcrumb', () => {
  describe('base render', () => {
    it('alwaysRenders_myLearningButton', () => {
      render(<ExternalLearningBreadcrumb onMyLearningClick={jest.fn()} />);
      expect(screen.getByText('alm.text.myLearning')).toBeInTheDocument();
    });

    it('withoutExternalLearningClick_showsExternalLearningAsLeafSpan', () => {
      render(<ExternalLearningBreadcrumb onMyLearningClick={jest.fn()} />);
      expect(screen.getByText('alm.text.externalLearning')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'alm.text.externalLearning' })).toBeNull();
    });

    it('withoutExternalLearningClick_rendersOneSeparator', () => {
      render(<ExternalLearningBreadcrumb onMyLearningClick={jest.fn()} />);
      expect(screen.getAllByText('>')).toHaveLength(1);
    });
  });

  describe('with onExternalLearningClick', () => {
    it('externalLearning_rendersAsButton', () => {
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={jest.fn()}
        />
      );
      expect(
        screen.getByRole('button', { name: 'alm.text.externalLearning' })
      ).toBeInTheDocument();
    });

    it('withoutCurrentLabel_rendersOneSeparator', () => {
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={jest.fn()}
        />
      );
      expect(screen.getAllByText('>')).toHaveLength(1);
    });
  });

  describe('with currentLabel', () => {
    it('currentLabel_rendersSpanWithTitleAttribute', () => {
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={jest.fn()}
          currentLabel="My External Learning"
        />
      );
      const span = screen.getByText('My External Learning');
      expect(span).toHaveAttribute('title', 'My External Learning');
    });

    it('currentLabel_titleAttributeMatchesTextContent', () => {
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={jest.fn()}
          currentLabel="A Very Long Course Title That Would Truncate"
        />
      );
      const span = screen.getByText('A Very Long Course Title That Would Truncate');
      expect(span).toHaveAttribute('title', 'A Very Long Course Title That Would Truncate');
    });

    it('currentLabel_rendersSecondSeparator', () => {
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={jest.fn()}
          currentLabel="My External Learning"
        />
      );
      expect(screen.getAllByText('>')).toHaveLength(2);
    });
  });

  describe('navigation callbacks', () => {
    it('clickMyLearning_firesCallback', () => {
      const onMyLearningClick = jest.fn();
      render(<ExternalLearningBreadcrumb onMyLearningClick={onMyLearningClick} />);
      fireEvent.click(screen.getByText('alm.text.myLearning'));
      expect(onMyLearningClick).toHaveBeenCalledTimes(1);
    });

    it('clickExternalLearning_firesCallback', () => {
      const onExternalLearningClick = jest.fn();
      render(
        <ExternalLearningBreadcrumb
          onMyLearningClick={jest.fn()}
          onExternalLearningClick={onExternalLearningClick}
          currentLabel="My Course"
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'alm.text.externalLearning' }));
      expect(onExternalLearningClick).toHaveBeenCalledTimes(1);
    });
  });
});
