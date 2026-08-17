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
import { GetTranslation } from '../../utils/translationService';
import styles from './PrimeExternalLearningAddForm.module.css';

interface Props {
  onMyLearningClick: () => void;
  onExternalLearningClick?: () => void;
  currentLabel?: string;
}

const ExternalLearningBreadcrumb = ({
  onMyLearningClick,
  onExternalLearningClick,
  currentLabel,
}: Props) => (
  <nav className={styles.breadcrumb} aria-label="breadcrumb">
    <button className={styles.breadcrumbLink} onClick={onMyLearningClick}>
      {GetTranslation('alm.text.myLearning', true)}
    </button>
    <span className={styles.breadcrumbSeparator}>{'>'}</span>
    {onExternalLearningClick ? (
      <>
        <button className={styles.breadcrumbLink} onClick={onExternalLearningClick}>
          {GetTranslation('alm.text.externalLearning', true)}
        </button>
        {currentLabel && (
          <>
            <span className={styles.breadcrumbSeparator}>{'>'}</span>
            <span className={styles.breadcrumbCurrent} title={currentLabel}>
              {currentLabel}
            </span>
          </>
        )}
      </>
    ) : (
      <span className={styles.breadcrumbCurrent}>
        {GetTranslation('alm.text.externalLearning', true)}
      </span>
    )}
  </nav>
);

export default ExternalLearningBreadcrumb;
