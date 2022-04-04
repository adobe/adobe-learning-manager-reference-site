export interface PrimeAccount {
  id: string;
  _transient: any;
  catalogsVisible: boolean;
  customDomain: string;
  dateCreated: string;
  disabledApps: Set<string>;
  elthorLocation: string;
  enableCardIcons: boolean;
  enableEnhancedLp: boolean;
  enableExternalSkills: boolean;
  enableOffline: boolean;
  enableSidebar: boolean;
  enableSocialAsHome: boolean;
  enableSocialLearning: boolean;
  exploreSkills: boolean;
  gamificationEnabled: boolean;
  hideRetiredTrainings: boolean;
  learnerLayout: string;
  locale: string;
  loginInBrowser: boolean;
  loginUrl: string;
  logoStyling: string;
  logoUrl: string;
  moduleResetEnabled: boolean;
  name: string;
  pageSetting: string;
  recommendationAccountType: string;
  showEffectiveness: boolean;
  showRating: boolean;
  socialPostApprovalType: string;
  subdomain: string;
  themeData: string;
  timeZoneCode: string;
  type: string;
  accountTerminologies: PrimeAccountTerminology[];
  contentLocales: PrimeLocalizationMetadata[];
  filterPanelSetting: object;
  gamificationLevels: PrimeGamificationLevel[];
  learnerHelpLinks: PrimeHelpLink[];
  timeZones: PrimeTimeZone[];
  uiLocales: PrimeLocalizationMetadata[];
}

export interface PrimeAccountTerminology {
  id: string;
  _transient: any;
  entityType: string;
  locale: string;
  name: string;
  pluralName: string;
}

export interface PrimeAdminAnnouncement {
  id: string;
  _transient: any;
  actionUrl: string;
  announcementType: string;
  expiryDate: string;
  liveDate: string;
  type: string;
  contentMetaData: PrimeLocalizationContentdata[];
}

export interface PrimeAnnouncement {
  id: string;
  _transient: any;
  contentId: string;
  contentType: string;
  contentUrl: string;
  description: string;
  duration: number;
  expiryDate: string;
  isDeleted: boolean;
  loId: string;
  loName: string;
  sentDate: string;
  sticky: boolean;
  thumbnailUrl: string;
}

export interface PrimeBadge {
  id: string;
  _transient: any;
  imageUrl: string;
  name: string;
  state: string;
  type: string;
}

export interface PrimeBoard {
  id: string;
  _transient: any;
  activityLevel: string;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  isFavorite: boolean;
  name: string;
  postCount: number;
  postingAllowed: boolean;
  richTextdescription: string;
  state: string;
  url: string;
  userCount: number;
  viewsCount: number;
  visibility: string;
  createdBy: PrimeUser;
  skills: PrimeSkill[];
}

export interface PrimeCatalog {
  id: string;
  _transient: any;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  imageUrl: string;
  isDefault: boolean;
  isInternallySearchable: boolean;
  isListable: boolean;
  name: string;
  state: string;
  type: string;
}

export interface PrimeCatalogLables {
  id: string;
  _transient: any;
  description: string;
  mandatory: boolean;
  name: string;
  values: string[];
}

export interface PrimeComment {
  id: string;
  _transient: any;
  commentMarker: string;
  dateCreated: string;
  dateUpdated: string;
  downVote: number;
  isCorrectAnswer: boolean;
  isPinned: string;
  myVoteStatus: string;
  otherData: string;
  replyCount: number;
  richText: string;
  state: string;
  text: string;
  upVote: number;
  resource: object;
  createdBy: PrimeUser;
  parent: PrimePost;
  previewData: PrimeCommentMetaData;
}

export interface PrimeCommentMetaData {
  author: string;
  author_url: string;
  description: string;
  perks: string;
  html: string;
  provider_name: string;
  thumbnail_height: number;
  thumbnail_url: string;
  thumbnail_width: string;
  title: string;
  type: string;
  url: string;
}

export interface PrimeCommentCreationAttributes {
  // resource: object;
  state: "ACTIVE";
  text: string;
}

export interface PrimeCounts {
  id: string;
  _transient: any;
  completed: string[];
  due: string[];
  entityType: string;
  overdue: string[];
  safe: string[];
  type: string;
}

export interface PrimeData {
  id: string;
  _transient: any;
  names: string[];
  type: string;
}

export interface PrimeDiscussionPost {
  id: string;
  _transient: any;
  comment: string;
  dateCreated: string;
  type: string;
  learner: PrimeUser;
}

export interface PrimeDnd {
  id: string;
  _transient: any;
  blockDirectEmail: boolean;
  blockDirectReportsEmail: boolean;
  blockEscalationEmailToMgr: boolean;
  blockSkipLevelReportsEmail: boolean;
}

export interface PrimeExternalProfile {
  id: string;
  _transient: any;
  accessKey: string;
  allowedDomains: string[];
  enabled: boolean;
  enrollmentCount: number;
  expiry: string;
  gamificationEnabled: boolean;
  imageUrl: string;
  loginRequired: number;
  managerEmail: string;
  name: string;
  paused: boolean;
  seatLimit: number;
  type: string;
  url: string;
  verifyEmail: boolean;
}

export interface PrimeFeedback {
  id: string;
  _transient: any;
  score: number;
  type: string;
  answers: PrimeFeedbackAnswer[];
}

export interface PrimeFeedbackAnswer {
  id: string;
  _transient: any;
  answer: string;
  questionId: string;
}

export interface PrimeFeedbackInfo {
  id: string;
  _transient: any;
  score: number;
  showAutomatically: boolean;
  type: string;
  questions: PrimeFeedbackQuestion[];
}

export interface PrimeFeedbackQuestion {
  id: string;
  _transient: any;
  answer: string;
  mandatory: boolean;
  questionId: string;
  questionType: string;
  localizedMetadata: PrimeLocalizationMetadata[];
}

export interface PrimeFilterPanelSetting {
  id: string;
  _transient: any;
  catalog: boolean;
  duration: boolean;
  format: boolean;
  skill: boolean;
  skillLevel: boolean;
  tag: boolean;
  type: boolean;
}

export interface PrimeGamificationLevel {
  id: string;
  _transient: any;
  color: string;
  name: string;
  points: number;
}

export interface PrimeHelpLink {
  id: string;
  _transient: any;
  isDefault: boolean;
  localizedHelpLink: PrimeLocalizedHelpLink[];
}

export interface PrimeJob {
  id: string;
  _transient: any;
  callbackUrl: string;
  dateCompleted: string;
  dateCreated: string;
  description: string;
  jobType: string;
  nextPayload: object;
  payload: object;
  status: object;
  type: string;
}

export interface PrimeLearnerAttemptInfo {
  id: string;
  _transient: any;
  attemptsFinishedCount: number;
  currentAttemptNumber: number;
  lastAttemptEndTime: string;
}

export interface PrimeLearningObject {
  id: string;
  _transient: any;
  authorNames: string[];
  bannerUrl: string;
  dateCreated: string;
  datePublished: string;
  dateUpdated: string;
  duration: number;
  effectiveModifiedDate: string;
  effectivenessIndex: number;
  enrollmentType: string;
  externalSkillNames: string[];
  hasOptionalLoResources: boolean;
  imageUrl: string;
  isEnhancedLP: boolean;
  isExternal: boolean;
  isMqaEnabled: boolean;
  isPrerequisiteEnforced: boolean;
  isSubLoOrderEnforced: boolean;
  loFormat: string;
  loType: string;
  moduleResetEnabled: boolean;
  rootCertificationId: string;
  state: string;
  tags: string[];
  type: string;
  unenrollmentAllowed: boolean;
  uniqueId: string;
  catalogLabels: PrimeCatalogLables[];
  localizedMetadata: PrimeLocalizationMetadata[];
  prequisiteConstraints: PrimePrerequisiteContraints[];
  rating: PrimeRating;
  sections: PrimeSections[];
  authors: PrimeUser[];
  enrollment: PrimeLearningObjectInstanceEnrollment;
  instances: PrimeLearningObjectInstance[];
  prerequisiteLOs: PrimeLearningObject[];
  skills: PrimeLearningObjectSkill[];
  subLOs: PrimeLearningObject[];
  supplementaryLOs: PrimeLearningObject[];
  supplementaryResources: PrimeResource[];
  skillNames?: string[]
  hasPreview: boolean;
}

export interface PrimeLearningObjectInstance {
  id: string;
  _transient: any;
  completionDeadline: string;
  dateCreated: string;
  enabledL1FeedbackForEachCourse: boolean;
  enrollmentDeadline: string;
  isDefault: boolean;
  isFlexible: boolean;
  seatLimit: number;
  state: string;
  type: string;
  validity: string;
  localizedMetadata: PrimeLocalizationMetadata[];
  badge: PrimeBadge;
  l1FeedbackInfo: PrimeFeedbackInfo;
  learningObject: PrimeLearningObject;
  loResources: PrimeLearningObjectResource[];
  subLoInstances: PrimeLearningObjectInstance[];
}

export interface PrimeLearningObjectInstanceEnrollment {
  id: string;
  _transient: any;
  completionDeadline: string;
  dateCompleted: string;
  dateEnrolled: string;
  dateStarted: string;
  enrollmentSource: string;
  hasPassed: boolean;
  lastAccessDate: string;
  progressPercent: number;
  rating: number;
  score: number;
  state: string;
  type: string;
  url: string;
  learner: PrimeUser;
  learnerBadge: PrimeUserBadge;
  learningObject: PrimeLearningObject;
  loInstance: PrimeLearningObjectInstance;
  loResourceGrades: PrimeLearningObjectResourceGrade[];
}

export interface PrimeLearningObjectResource {
  id: string;
  _transient: any;
  checklistEvaluationStatus: string;
  externalReporting: boolean;
  loResourceType: string;
  mandatory: boolean;
  multipleAttemptEnabled: boolean;
  resourceSubType: string;
  resourceType: string;
  submissionEnabled: boolean;
  submissionState: string;
  submissionUrl: string;
  type: string;
  version: number;
  learnerAttemptInfo: object;
  localizedMetadata: PrimeLocalizationMetadata[];
  multipleAttempt: object;
  learningObject: PrimeLearningObject;
  loInstance: PrimeLearningObjectInstance;
  resources: PrimeResource[];
  previewEnabled: boolean;
}

export interface PrimeLearningObjectResourceGrade {
  id: string;
  _transient: any;
  dateCompleted: string;
  dateStarted: string;
  dateSuccess: string;
  duration: number;
  hasPassed: boolean;
  progressPercent: number;
  score: number;
  type: string;
  loResource: PrimeLearningObjectResource;
}

export interface PrimeLearningObjectSkill {
  id: string;
  _transient: any;
  credits: number;
  learningObjectId: string;
  type: string;
  learningObject: PrimeLearningObject;
  skillLevel: PrimeSkillLevel;
}

export interface PrimeLoInstanceSummary {
  id: string;
  _transient: any;
  asOf: string;
  completionCount: number;
  enrollmentCount: number;
  seatLimit: number;
  type: string;
  waitlistCount: number;
}

export interface PrimeLocalizationContentdata {
  id: string;
  _transient: any;
  contentSources: string[];
  contentType: string;
  contentUrl: string;
  locale: string;
  thumbnailUrl: string;
}

export interface PrimeLocalizationMetadata {
  id: string;
  _transient: any;
  description: string;
  locale: string;
  name: string;
  overview: string;
  richTextOverview: string;
  type: string;
}

export interface PrimeLocalizedHelpLink {
  id: string;
  _transient: any;
  link: string;
  locale: string;
  name: string;
}

export interface PrimeMinimalAccount {
  id: string;
  _transient: any;
  enableOffline: boolean;
  enableSocialLearning: boolean;
  locale: string;
  loginInBrowser: boolean;
  loginUrl: string;
  logoStyling: string;
  logoUrl: string;
  name: string;
  showEffectiveness: boolean;
  subdomain: string;
  themeData: string;
  type: string;
  accountTerminologies: PrimeAccountTerminology[];
}

export interface PrimeMultipleAttempt {
  id: string;
  _transient: any;
  allowedRevisitAfterMaxAttempts: boolean;
  attemptDuration: number;
  attemptEndCriteria: string;
  infiniteAttempts: boolean;
  maxAttemptCount: number;
  stopAttemptOnSuccessfulComplete: boolean;
  timeBetweenAttempts: number;
}

export interface PrimeNote {
  id: string;
  _transient: any;
  marker: string;
  text: string;
  type: string;
  loResource: PrimeLearningObjectResource;
}

export interface PrimePoll {
  id: string;
  _transient: any;
  dateCreated: string;
  optionId: number;
}

export interface PrimePost {
  id: string;
  _transient: any;
  commentCount: number;
  dateCreated: string;
  dateUpdated: string;
  downVote: number;
  isAnswered: boolean;
  isCurated: boolean;
  isPinned: string;
  myVoteStatus: string;
  otherData: string;
  pollStats: string;
  postingType: string;
  richText: string;
  state: string;
  text: string;
  thumbnailUrl: string;
  upVote: number;
  viewsCount: number;
  myPoll: object;
  resource: object;
  createdBy: PrimeUser;
  parent: PrimeBoard;
  previewData: PrimePostMetaData;
  userPoll: {
    optionId: number;
  };
}

export interface PrimePostMetaData {
  author: string;
  author_url: string;
  description: string;
  perks: string;
  html: string;
  provider_name: string;
  thumbnail_height: number;
  thumbnail_url: string;
  thumbnail_width: string;
  title: string;
  type: string;
  url: string;
}

export interface PrimePostCreationAttributes {
  postingType: "DEFAULT" | "QUESTION" | "POLL";
  resource: {
    contentType: "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER";
    data: string;
  };
  state: "ACTIVE";
  text: string;
}

export interface PrimePrerequisiteContraints {
  id: string;
  _transient: any;
  mandatory: boolean;
  prerequisiteLOId: string;
}

export interface PrimeRating {
  id: string;
  _transient: any;
  averageRating: number;
  ratingsCount: number;
}

export interface PrimeRecommendation {
  id: string;
  _transient: any;
  externalSkills: object;
  internalSkills: object;
  reason: string[];
  type: string;
  learningObject: PrimeLearningObject;
}

export interface PrimeReply {
  id: string;
  _transient: any;
  dateCreated: string;
  dateUpdated: string;
  downVote: number;
  isPinned: string;
  myVoteStatus: string;
  otherData: string;
  richText: string;
  state: string;
  text: string;
  upVote: number;
  resource: object;
  createdBy: PrimeUser;
  parent: PrimeComment;
  previewData: PrimeReplyMetaData;
}

export interface PrimeReplyMetaData {
  author: string;
  author_url: string;
  description: string;
  perks: string;
  html: string;
  provider_name: string;
  thumbnail_height: number;
  thumbnail_url: string;
  thumbnail_width: string;
  title: string;
  type: string;
  url: string;
}

export interface PrimeReplyCreationAttributes {
  resource?: {
    contentType:
    | "VIDEO"
    | "URL"
    | "IMAGE"
    | "TEXT"
    | "FILE"
    | "AUDIO"
    | "OTHER";
    data: string;
  };
  state: "ACTIVE";
  text: string;
}

export interface PrimeReportAbuse {
  id: string;
  _transient: any;
  reason: string;
}

export interface PrimeResource {
  id: string;
  _transient: any;
  authorDesiredDuration: number;
  captionSourceUrl: string;
  completionDeadline: string;
  contentStructureInfoUrl: string;
  contentType: string;
  contentZipSize: number;
  contentZipUrl: string;
  dateCreated: string;
  dateStart: string;
  desiredDuration: number;
  downloadUrl: string;
  extraData: string;
  hasQuiz: boolean;
  hasToc: boolean;
  instructorNames: string[];
  isDefault: boolean;
  locale: string;
  location: string;
  name: string;
  onlyQuiz: boolean;
  reportingInfo: string;
  reportingType: string;
  seatLimit: number;
  type: string;
  room: PrimeRoom;
}

export interface PrimeRoom {
  id: string;
  _transient: any;
  roomInfo: string;
  roomName: string;
  seatLimit: number;
  url: string;
}

export interface PrimeSearchResult {
  id: string;
  _transient: any;
  actionUrl: string;
  completionDeadline: string;
  description: string;
  imageUrl: string;
  modelSubType: string;
  modelType: string;
  name: string;
  progressPercent: number;
  skillType: string;
  state: string;
  type: string;
  snippets: PrimeSearchSnippet[];
  model:
  | PrimeLearningObject
  | PrimeCatalog
  | PrimeSkill
  | PrimeBadge
  | PrimeBoard
  | PrimePost
  | PrimeUser;
}

export interface PrimeSearchSnippet {
  id: string;
  _transient: any;
  snippet: string;
  snippetType: string;
}

export interface PrimeSections {
  id: string;
  _transient: any;
  loIds: string[];
  mandatory: boolean;
  mandatoryLOCount: number;
  sectionId: string;
  localizedMetadata: PrimeLocalizationMetadata[];
}

export interface PrimeSkill {
  id: string;
  _transient: any;
  description: string;
  name: string;
  state: string;
  type: string;
  levels: PrimeSkillLevel[];
}

export interface PrimeSkillInterestSearchResult {
  id: string;
  _transient: any;
  name: string;
  type: string;
}

export interface PrimeSkillLevel {
  id: string;
  _transient: any;
  level: string;
  maxCredits: number;
  name: string;
  type: string;
  badge: PrimeBadge;
  skill: PrimeSkill;
}

export interface PrimeSocialProfile {
  id: string;
  _transient: any;
  commentCount: number;
  followerCount: number;
  postCount: number;
  socialPoints: number;
  user: object;
  windowedStats: object;
}

export interface PrimeSocialResource {
  id: string;
  _transient: any;
  contentType: string;
  data: string;
  duration: number;
  sourceUrl: string;
  state: string;
}

export interface PrimeStory {
  id: string;
  _transient: any;
  dateCreated: string;
  state: string;
  title: string;
  createdBy: PrimeUser;
}

export interface PrimeTimeZone {
  id: string;
  _transient: any;
  name: string;
  timeZoneCode: string;
  utcOffset: number;
  utcOffsetCode: string;
  zoneId: string;
}

export interface PrimeUploadInfo {
  // id: string;
  // _transient: any;
  awsKey: string;
  bucket: string;
  key: string;
  region: string;
  awsUrl: string;
}

export interface PrimeUser {
  id: string;
  _transient: any;
  avatarUrl: string;
  binUserId: string;
  bio: string;
  contentLocale: string;
  email: string;
  enrollOnClick: boolean;
  fields: object;
  gamificationEnabled: boolean;
  lastLoginDate: string;
  metadata: object;
  name: string;
  pointsEarned: number;
  pointsRedeemed: number;
  profile: string;
  roles: string[];
  state: string;
  timeZoneCode: string;
  type: string;
  uiLocale: string;
  userType: string;
  userUniqueId: string;
  account: PrimeAccount;
  manager: PrimeUser;
}

export interface PrimeUserBadge {
  id: string;
  _transient: any;
  assertionUrl: string;
  dateAchieved: string;
  expiryDate: string;
  modelType: string;
  type: string;
  badge: PrimeBadge;
  learner: PrimeUser;
  model: PrimeLearningObject | PrimeSkillLevel;
}

export interface PrimeUserCalendar {
  id: string;
  _transient: any;
  courseInstanceName: string;
  courseName: string;
  courseType: string;
  dateEnd: string;
  dateStart: string;
  enrolled: boolean;
  enrolledToCourseInstance: boolean;
  instructorNames: string[];
  location: string;
  month: number;
  quarter: number;
  sessionName: string;
  type: string;
  containerLO: PrimeLearningObject;
  course: PrimeLearningObject;
  instructors: PrimeUser[];
  room: PrimeRoom;
}

export interface PrimeUserGroup {
  id: string;
  _transient: any;
  dateCreated: string;
  description: string;
  name: string;
  readOnly: boolean;
  state: string;
  type: string;
  userCount: number;
}

export interface PrimeUserGroupSearchResult {
  id: string;
  _transient: any;
  name: string;
  type: string;
}

export interface PrimeUserNotification {
  id: string;
  _transient: any;
  actionTaken: boolean;
  channel: string;
  dateCreated: string;
  message: string;
  modelIds: string[];
  modelNames: string[];
  modelTypes: string[];
  read: boolean;
  role: string;
  type: string;
  announcement: object;
}

export interface PrimeUserSetting {
  id: string;
  _transient: any;
  type: string;
  dndSetting: object;
}

export interface PrimeUserSkill {
  id: string;
  _transient: any;
  dateAchieved: string;
  dateCreated: string;
  pointsEarned: number;
  type: string;
  learnerBadge: PrimeUserBadge;
  learningObject: PrimeLearningObject[];
  skill: PrimeSkill;
  skillLevel: PrimeSkillLevel;
  user: PrimeUser;
}

export interface PrimeUserSkillInterest {
  id: string;
  _transient: any;
  dateCreated: string;
  source: string;
  type: string;
  skill: PrimeSkill;
  user: PrimeUser;
  userSkills: PrimeUserSkill[];
}

export interface PrimeUserStat {
  id: string;
  _transient: any;
  postCount: number;
}

export interface PrimeUserStat {
  id: string;
  _transient: any;
  postCount: number;
}

export interface PrimeResourceIdentifier {
  id: string;
  _transient: any;
}

export interface JsonApiResponse {
  account: PrimeAccount;
  accountList: PrimeAccount[];
  accountTerminology: PrimeAccountTerminology;
  accountTerminologyList: PrimeAccountTerminology[];
  adminAnnouncement: PrimeAdminAnnouncement;
  adminAnnouncementList: PrimeAdminAnnouncement[];
  announcement: PrimeAnnouncement;
  announcementList: PrimeAnnouncement[];
  badge: PrimeBadge;
  badgeList: PrimeBadge[];
  board: PrimeBoard;
  boardList: PrimeBoard[];
  catalog: PrimeCatalog;
  catalogList: PrimeCatalog[];
  catalogLables: PrimeCatalogLables;
  catalogLablesList: PrimeCatalogLables[];
  comment: PrimeComment;
  commentList: PrimeComment[];
  counts: PrimeCounts;
  countsList: PrimeCounts[];
  data: PrimeData;
  dataList: PrimeData[];
  discussionPost: PrimeDiscussionPost;
  discussionPostList: PrimeDiscussionPost[];
  dnd: PrimeDnd;
  dndList: PrimeDnd[];
  externalProfile: PrimeExternalProfile;
  externalProfileList: PrimeExternalProfile[];
  feedback: PrimeFeedback;
  feedbackList: PrimeFeedback[];
  feedbackAnswer: PrimeFeedbackAnswer;
  feedbackAnswerList: PrimeFeedbackAnswer[];
  feedbackInfo: PrimeFeedbackInfo;
  feedbackInfoList: PrimeFeedbackInfo[];
  feedbackQuestion: PrimeFeedbackQuestion;
  feedbackQuestionList: PrimeFeedbackQuestion[];
  filterPanelSetting: PrimeFilterPanelSetting;
  filterPanelSettingList: PrimeFilterPanelSetting[];
  gamificationLevel: PrimeGamificationLevel;
  gamificationLevelList: PrimeGamificationLevel[];
  helpLink: PrimeHelpLink;
  helpLinkList: PrimeHelpLink[];
  job: PrimeJob;
  jobList: PrimeJob[];
  learnerAttemptInfo: PrimeLearnerAttemptInfo;
  learnerAttemptInfoList: PrimeLearnerAttemptInfo[];
  learningObject: PrimeLearningObject;
  learningObjectList: PrimeLearningObject[];
  learningObjectInstance: PrimeLearningObjectInstance;
  learningObjectInstanceList: PrimeLearningObjectInstance[];
  learningObjectInstanceEnrollment: PrimeLearningObjectInstanceEnrollment;
  learningObjectInstanceEnrollmentList: PrimeLearningObjectInstanceEnrollment[];
  learningObjectResource: PrimeLearningObjectResource;
  learningObjectResourceList: PrimeLearningObjectResource[];
  learningObjectResourceGrade: PrimeLearningObjectResourceGrade;
  learningObjectResourceGradeList: PrimeLearningObjectResourceGrade[];
  learningObjectSkill: PrimeLearningObjectSkill;
  learningObjectSkillList: PrimeLearningObjectSkill[];
  loInstanceSummary: PrimeLoInstanceSummary;
  loInstanceSummaryList: PrimeLoInstanceSummary[];
  localizationContentdata: PrimeLocalizationContentdata;
  localizationContentdataList: PrimeLocalizationContentdata[];
  localizationMetadata: PrimeLocalizationMetadata;
  localizationMetadataList: PrimeLocalizationMetadata[];
  localizedHelpLink: PrimeLocalizedHelpLink;
  localizedHelpLinkList: PrimeLocalizedHelpLink[];
  minimalAccount: PrimeMinimalAccount;
  minimalAccountList: PrimeMinimalAccount[];
  multipleAttempt: PrimeMultipleAttempt;
  multipleAttemptList: PrimeMultipleAttempt[];
  note: PrimeNote;
  noteList: PrimeNote[];
  poll: PrimePoll;
  pollList: PrimePoll[];
  post: PrimePost;
  postList: PrimePost[];
  prerequisiteContraints: PrimePrerequisiteContraints;
  prerequisiteContraintsList: PrimePrerequisiteContraints[];
  rating: PrimeRating;
  ratingList: PrimeRating[];
  recommendation: PrimeRecommendation;
  recommendationList: PrimeRecommendation[];
  reply: PrimeReply;
  replyList: PrimeReply[];
  reportAbuse: PrimeReportAbuse;
  reportAbuseList: PrimeReportAbuse[];
  resource: PrimeResource;
  resourceList: PrimeResource[];
  room: PrimeRoom;
  roomList: PrimeRoom[];
  searchResult: PrimeSearchResult;
  searchResultList: PrimeSearchResult[];
  searchSnippet: PrimeSearchSnippet;
  searchSnippetList: PrimeSearchSnippet[];
  sections: PrimeSections;
  sectionsList: PrimeSections[];
  skill: PrimeSkill;
  skillList: PrimeSkill[];
  skillInterestSearchResult: PrimeSkillInterestSearchResult;
  skillInterestSearchResultList: PrimeSkillInterestSearchResult[];
  skillLevel: PrimeSkillLevel;
  skillLevelList: PrimeSkillLevel[];
  socialProfile: PrimeSocialProfile;
  socialProfileList: PrimeSocialProfile[];
  socialResource: PrimeSocialResource;
  socialResourceList: PrimeSocialResource[];
  story: PrimeStory;
  storyList: PrimeStory[];
  timeZone: PrimeTimeZone;
  timeZoneList: PrimeTimeZone[];
  uploadInfo: PrimeUploadInfo;
  uploadInfoList: PrimeUploadInfo[];
  user: PrimeUser;
  userList: PrimeUser[];
  userBadge: PrimeUserBadge;
  userBadgeList: PrimeUserBadge[];
  userCalendar: PrimeUserCalendar;
  userCalendarList: PrimeUserCalendar[];
  userGroup: PrimeUserGroup;
  userGroupList: PrimeUserGroup[];
  userGroupSearchResult: PrimeUserGroupSearchResult;
  userGroupSearchResultList: PrimeUserGroupSearchResult[];
  userNotification: PrimeUserNotification;
  userNotificationList: PrimeUserNotification[];
  userSetting: PrimeUserSetting;
  userSettingList: PrimeUserSetting[];
  userSkill: PrimeUserSkill;
  userSkillList: PrimeUserSkill[];
  userSkillInterest: PrimeUserSkillInterest;
  userSkillInterestList: PrimeUserSkillInterest[];
  userStat: PrimeUserStat;
  userStatList: PrimeUserStat[];
  resourceIdentifier: PrimeResourceIdentifier;
  resourceIdentifierList: PrimeResourceIdentifier[];
  links?: JsonApiResponseLinks;
}

export interface JsonApiResponseLinks {
  self: string;
  next?: string;
  prev?: string;
}

export interface PrimeFileUpload {
  fileName: string;
  uploadProgress: number;
}


