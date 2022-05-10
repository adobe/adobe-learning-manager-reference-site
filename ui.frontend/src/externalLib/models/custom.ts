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
export interface Skill {
  name: string;
  levelName: string;
  level: string;
  credits: number;
  maxCredits: number;
  type: string;
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export interface InstanceBadge {
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export interface CardBgStyle {
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  background?: string;
}

export interface AccountActiveFields {
  fields: Field[];
}

interface Field {
  name: string;
  allowedValues: string[];
  isMultiValue: boolean;
}

export interface ESPrimeLearningObjectInstance {
  id: string;
  name: string;
  status: string;
  completionDeadline: string;
}

export interface ESPrimeLearningObject {
  authors: string[];
  averageRating: number;
  dateCreated: string;
  deliveryType: string;
  duration: number;
  loId: string;
  loSkillLevels: string[];
  loSkillNames: string[];
  loType: string;
  name: string;
  publishDate: string;
  ratingsCount: number;
  description: string;
  tags: string[];
  loInstances: ESPrimeLearningObjectInstance[];
}

export interface CommercePrimeLearningObject {
  almauthor: string[];
  almavgrating: number;
  almdeliverytype: string;
  almduration: number;
  almlotype: string;
  almpublishdate: string;
  almratingscount: number;
  almskill: string;
  almstatus: string;
  almtags: string[];
  almthumbnailurl: string;
  almusecourseeffectiveness: string;
  almusecourserating: string;
  description: { html: string, __typename: string }
  name: string;
  sku: string;
  price_range: {
    maximum_price: {
      final_price: {
        value: number
        currency: string
      }
    }
  }
}

// export interface CatalogLearningObject {
//   id: string;
//   authorNames: string[];
//   bannerUrl: string;
//   dateCreated: string;
//   datePublished: string;
//   dateUpdated: string;
//   duration: number;
//   effectiveModifiedDate: string;
//   effectivenessIndex: number;
//   enrollmentType: string;
//   externalSkillNames: string[];
//   hasOptionalLoResources: boolean;
//   imageUrl: string;
//   isEnhancedLP: boolean;
//   isExternal: boolean;
//   isMqaEnabled: boolean;
//   isPrerequisiteEnforced: boolean;
//   isSubLoOrderEnforced: boolean;
//   loFormat: string;
//   loType: string;
//   moduleResetEnabled: boolean;
//   rootCertificationId: string;
//   state: string;
//   tags: string[];
//   type: string;
//   unenrollmentAllowed: boolean;
//   uniqueId: string;
//   catalogLabels: PrimeCatalogLables[];
//   localizedMetadata: PrimeLocalizationMetadata[];
//   prequisiteConstraints: PrimePrerequisiteContraints[];
//   rating: PrimeRating;
//   sections: PrimeSections[];
//   authors: PrimeUser[];
//   enrollment: PrimeLearningObjectInstanceEnrollment;
//   instances: PrimeLearningObjectInstance[];
//   prerequisiteLOs: PrimeLearningObject[];
//   skills: PrimeLearningObjectSkill[];
//   subLOs: PrimeLearningObject[];
//   supplementaryLOs: PrimeLearningObject[];
//   supplementaryResources: PrimeResource[];
//   skillNames?: string[]
//   hasPreview: boolean;
// }
