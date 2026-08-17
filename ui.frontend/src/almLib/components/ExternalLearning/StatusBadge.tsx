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
import { GetTranslation } from '../../utils/translationService';
import {
  STATUS_CONFIG,
  STATUS_STYLE_KEY,
  ExternalLearningStatus,
} from './externalLearningConstants';
import styles from './PrimeExternalLearningDetailContainer.module.css';

const StatusBadge = ({ status }: { status: string }) => {
  const key = (
    STATUS_CONFIG[status as ExternalLearningStatus] ? status : 'PENDING'
  ) as ExternalLearningStatus;
  return (
    <span className={`${styles.statusBadge} ${styles[STATUS_STYLE_KEY[key]]}`}>
      {GetTranslation(STATUS_CONFIG[key].labelKey)}
    </span>
  );
};

export default StatusBadge;
