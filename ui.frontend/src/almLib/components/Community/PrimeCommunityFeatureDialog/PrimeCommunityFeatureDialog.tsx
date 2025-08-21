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
import { useIntl } from 'react-intl';
import { ALMDialog, ALMDialogContent, ALMDialogFooter, ALMDialogHeader } from '../../ALMDialog';
import { Button } from '@adobe/react-spectrum';
import SocialFeatureCardSvg from '../../../assets/images/social_feature_card.svg';
import styles from './PrimeCommunityFeatureDialog.module.css';

interface PrimeCommunityFeatureDialogProps {
  id: string;
  onClose: () => void;
}

const PrimeCommunityFeatureDialog: React.FC<PrimeCommunityFeatureDialogProps> = ({
  id,
  onClose,
}) => {
  const { formatMessage } = useIntl();

  return (
    <ALMDialog
      id={id}
      direction="center"
      height={34}
      overlayClose={true}
      borderRadius="all"
      className={styles.almDialogBorderRadiusAll}
    >
      <ALMDialogHeader className={styles.almDialogHeader}>
      <div className={styles.featureDialogImageContainer}>
            <img 
              src={SocialFeatureCardSvg} 
              alt="Social Feature" 
              className={styles.featureDialogImage}
            />
          </div>
      </ALMDialogHeader>
      <ALMDialogContent>
        <div className={styles.featureDialogContainer}>
          
          <div className={styles.featureDialogContent}>
            <h2 className={styles.featureDialogTitle}>
              {formatMessage({
                id: "alm.community.feature.title",
                defaultMessage: "Tag users in comments",
              })}
            </h2>
            <p className={styles.featureDialogDescription}>
              {formatMessage({
                id: "alm.community.feature.description",
                defaultMessage: "Enter @ followed by at least 3 characters to find and tag users in any post or comment to get quicker attention. They'll get notified right away.",
              })}
            </p>            
          </div>
        </div>
      </ALMDialogContent>
      <ALMDialogFooter className={styles.almDialogFooter}>
        <Button
          variant="primary"
          type="button"
          onPress={onClose}
          UNSAFE_className={`almButton primary ${styles.featureDialogButton}`}
        >
          {formatMessage({
            id: "alm.community.feature.okay",
            defaultMessage: "Okay",
          })}
        </Button>
      </ALMDialogFooter>  
    </ALMDialog>
  );
};

export default PrimeCommunityFeatureDialog;
