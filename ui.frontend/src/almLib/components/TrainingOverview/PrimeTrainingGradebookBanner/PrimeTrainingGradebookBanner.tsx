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
import { Link } from '@adobe/react-spectrum';
import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import { GetTranslation } from '../../../utils/translationService';
import styles from './PrimeTrainingGradebookBanner.module.css';

export type PrimeTrainingGradebookBannerProps = {
  onViewGradebook: () => void;
};

const PrimeTrainingGradebookBanner: React.FC<PrimeTrainingGradebookBannerProps> = ({
  onViewGradebook,
}) => {
  return (
    <div
      className={styles.banner}
      role="region"
      aria-label={GetTranslation('alm.overview.gradebook.modulesBanner.ariaLabel', true)}
      data-automationid="gradebook-modules-banner"
    >
      <span className={styles.icon} aria-hidden="true">
        <Info />
      </span>
      <p className={styles.text}>
        {GetTranslation('alm.overview.gradebook.modulesBanner.body', true)}{' '}
        <Link onPress={onViewGradebook} UNSAFE_className={styles.link}>
          {GetTranslation('alm.overview.gradebook.modulesBanner.link', true)}
        </Link>
      </p>
    </div>
  );
};

export default PrimeTrainingGradebookBanner;
