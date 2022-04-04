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
}

// export interface CatalogLearningObject {
//   id: string;
//   _transient: any;
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
