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
import { fireEvent, render } from '@testing-library/react';
import PrimeCourseOverview from '@components/TrainingOverview/PrimeCourseOverview/PrimeCourseOverview';
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from '@models/PrimeModels';
import { COURSE_OVERVIEW_TAB_KEYS } from '@utils/constants';

const mockUseCourseGradebook = jest.fn();

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({ user: { contentLocale: 'en_US', userType: 'INTERNAL' } }),
}));

jest.mock('react-intl', () => ({
  useIntl: () => ({ locale: 'en-US' }),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
  getPreferredLocalizedMetadata: () => ({ name: 'Course Name' }),
}));

jest.mock('@utils/hooks', () => ({
  filterLoReourcesBasedOnResourceType: (_instance: unknown, type: string) => {
    if (type === 'Content') {
      return [{ id: 'module-1', localizedMetadata: [] }];
    }
    return [];
  },
  getDuration: () => 0,
  getEnrollment: () => ({ state: 'ENROLLED' }),
}));

jest.mock('@hooks/training/useCourseGradebook', () => ({
  useCourseGradebook: (...args: unknown[]) => mockUseCourseGradebook(...args),
}));

jest.mock('@utils/overview', () => ({
  checkIsEnrolled: () => true,
}));

jest.mock('@components/TrainingOverview/PrimeModuleList', () => ({
  PrimeModuleList: () => <div data-testid="module-list" />,
}));

jest.mock('@components/TrainingOverview/PrimeGradebook', () => ({
  PrimeGradebook: () => <div data-testid="gradebook-panel" />,
}));

jest.mock('@components/TrainingOverview/PrimeTrainingGradebookBanner', () => ({
  PrimeTrainingGradebookBanner: ({ onViewGradebook }: { onViewGradebook: () => void }) => (
    <button data-testid="gradebook-banner-link" onClick={onViewGradebook}>
      View gradebook
    </button>
  ),
}));

jest.mock('@react-spectrum/tabs', () => {
  const React = require('react');

  const TabList = ({ children, UNSAFE_className }: any) => (
    <div data-component="tablist" className={UNSAFE_className}>
      {children}
    </div>
  );
  const TabPanels = ({ children }: any) => (
    <div data-component="tabpanels">{children}</div>
  );
  function Item({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  const Tabs = ({
    children,
    selectedKey,
    onSelectionChange,
    UNSAFE_className,
  }: {
    children: React.ReactNode;
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    UNSAFE_className?: string;
  }) => {
    const normalizeKey = (key: string | null) => (key ?? '').replace(/^\.\$/, '');

    let tabListChild: React.ReactElement | null = null;
    let tabPanelsChild: React.ReactElement | null = null;

    React.Children.forEach(children, child => {
      if (!React.isValidElement(child)) {
        return;
      }
      if (child.type === TabList) {
        tabListChild = child;
      }
      if (child.type === TabPanels) {
        tabPanelsChild = child;
      }
    });

    const tabs = React.Children.toArray(tabListChild?.props.children ?? []);
    const panels = React.Children.toArray(tabPanelsChild?.props.children ?? []);
    const activePanel = panels.find(
      (panel: any) => normalizeKey(panel.key) === normalizeKey(selectedKey)
    );

    return (
      <div data-testid="course-overview-tabs" className={UNSAFE_className}>
        <div
          role="tablist"
          data-testid="course-overview-tablist"
          className={tabListChild?.props.UNSAFE_className}
        >
          {tabs.map((tab: any) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={normalizeKey(tab.key) === normalizeKey(selectedKey)}
              data-testid={`tab-${normalizeKey(tab.key)}`}
              onClick={() => onSelectionChange(normalizeKey(tab.key))}
            >
              {tab.props.children}
            </button>
          ))}
        </div>
        <div data-testid="course-overview-tabpanel">{activePanel}</div>
      </div>
    );
  };

  return { __esModule: true, Tabs, TabList, TabPanels, Item };
});

const makeTraining = (): PrimeLearningObject =>
  ({
    id: 'course-1',
    enableSocial: false,
    localizedMetadata: [],
    enrollment: { state: 'ENROLLED' },
  } as unknown as PrimeLearningObject);

const makeInstance = (): PrimeLearningObjectInstance =>
  ({
    id: 'instance-1',
    localizedMetadata: [],
    loResources: [{ id: 'module-1' }],
  } as unknown as PrimeLearningObjectInstance);

const defaultProps = {
  training: makeTraining(),
  trainingInstance: makeInstance(),
  launchPlayerHandler: jest.fn(),
  isPartOfLP: true,
  isParentLOEnrolled: true,
  isRootLOEnrolled: true,
  isRootLoPreviewEnabled: false,
  showNotes: false,
  isPreviewEnabled: false,
  updateFileSubmissionUrl: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  downloadNotes: jest.fn(),
  sendNotesOnMail: jest.fn(),
  notes: [],
  lastPlayingLoResourceId: '',
  setTimeBetweenAttemptEnabled: jest.fn(),
  timeBetweenAttemptEnabled: false,
  parentHasEnforcedPrerequisites: false,
  parentHasSubLoOrderEnforced: false,
  isTrainingLocked: false,
  updatePlayerLoState: jest.fn(),
  isRootLoCompleted: false,
  setEnrollViaModuleClick: jest.fn(),
  discussionUtils: {
    discussions: [],
    postDiscussion: jest.fn(),
    getAllDiscussion: jest.fn(),
    loadMoreDiscussion: jest.fn(),
    deleteDiscussion: jest.fn(),
    showMoreDiscussionLink: false,
  },
};

describe('PrimeCourseOverview', () => {
  beforeEach(() => {
    mockUseCourseGradebook.mockReturnValue({
      gradebookOrderedResources: [{ id: 'module-1' } as PrimeLearningObjectResource],
      showGradebook: true,
    });
  });

  describe('gradebook visibility inside LP', () => {
    it('hides gradebook tab and banner when course is part of an LP', () => {
      const { getByTestId, queryByTestId, getAllByRole } = render(
        <PrimeCourseOverview {...defaultProps} />
      );
      expect(getAllByRole('tab')).toHaveLength(1);
      expect(getByTestId(`tab-${COURSE_OVERVIEW_TAB_KEYS.MODULES}`)).toBeTruthy();
      expect(queryByTestId(`tab-${COURSE_OVERVIEW_TAB_KEYS.GRADEBOOK}`)).toBeNull();
      expect(queryByTestId('gradebook-banner-link')).toBeNull();
    });

    it('shows gradebook tab and banner when course is standalone', () => {
      const { getByTestId, getAllByRole } = render(
        <PrimeCourseOverview {...defaultProps} isPartOfLP={false} />
      );
      expect(getAllByRole('tab')).toHaveLength(2);
      expect(getByTestId(`tab-${COURSE_OVERVIEW_TAB_KEYS.MODULES}`)).toBeTruthy();
      expect(getByTestId(`tab-${COURSE_OVERVIEW_TAB_KEYS.GRADEBOOK}`)).toBeTruthy();
      expect(getByTestId('gradebook-banner-link')).toBeTruthy();
    });
  });
});
