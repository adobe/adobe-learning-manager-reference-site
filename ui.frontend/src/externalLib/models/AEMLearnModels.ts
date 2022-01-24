export interface AEMLearnAccount {
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
	accountTerminologies: AEMLearnAccountTerminology[];
	contentLocales: AEMLearnLocalizationMetadata[];
	filterPanelSetting: object;
	gamificationLevels: AEMLearnGamificationLevel[];
	learnerHelpLinks: AEMLearnHelpLink[];
	timeZones: AEMLearnTimeZone[];
	uiLocales: AEMLearnLocalizationMetadata[];
}

export interface AEMLearnAccountTerminology {
	id: string;
	_transient: any;
	entityType: string;
	locale: string;
	name: string;
	pluralName: string;
}

export interface AEMLearnAdminAnnouncement {
	id: string;
	_transient: any;
	actionUrl: string;
	announcementType: string;
	expiryDate: string;
	liveDate: string;
	type: string;
	contentMetaData: AEMLearnLocalizationContentdata[];
}

export interface AEMLearnAnnouncement {
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

export interface AEMLearnBadge {
	id: string;
	_transient: any;
	imageUrl: string;
	name: string;
	state: string;
	type: string;
}

export interface AEMLearnBoard {
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
	createdBy: AEMLearnUser;
	skills: AEMLearnSkill[];
}

export interface AEMLearnCatalog {
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

export interface AEMLearnCatalogLables {
	id: string;
	_transient: any;
	description: string;
	mandatory: boolean;
	name: string;
	values: string[];
}

export interface AEMLearnComment {
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
	createdBy: AEMLearnUser;
	parent: AEMLearnPost;
}

export interface AEMLearnCounts {
	id: string;
	_transient: any;
	completed: string[];
	due: string[];
	entityType: string;
	overdue: string[];
	safe: string[];
	type: string;
}

export interface AEMLearnData {
	id: string;
	_transient: any;
	names: string[];
	type: string;
}

export interface AEMLearnDiscussionPost {
	id: string;
	_transient: any;
	comment: string;
	dateCreated: string;
	type: string;
	learner: AEMLearnUser;
}

export interface AEMLearnDnd {
	id: string;
	_transient: any;
	blockDirectEmail: boolean;
	blockDirectReportsEmail: boolean;
	blockEscalationEmailToMgr: boolean;
	blockSkipLevelReportsEmail: boolean;
}

export interface AEMLearnExternalProfile {
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

export interface AEMLearnFeedback {
	id: string;
	_transient: any;
	score: number;
	type: string;
	answers: AEMLearnFeedbackAnswer[];
}

export interface AEMLearnFeedbackAnswer {
	id: string;
	_transient: any;
	answer: string;
	questionId: string;
}

export interface AEMLearnFeedbackInfo {
	id: string;
	_transient: any;
	score: number;
	showAutomatically: boolean;
	type: string;
	questions: AEMLearnFeedbackQuestion[];
}

export interface AEMLearnFeedbackQuestion {
	id: string;
	_transient: any;
	answer: string;
	mandatory: boolean;
	questionId: string;
	questionType: string;
	localizedMetadata: AEMLearnLocalizationMetadata[];
}

export interface AEMLearnFilterPanelSetting {
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

export interface AEMLearnGamificationLevel {
	id: string;
	_transient: any;
	color: string;
	name: string;
	points: number;
}

export interface AEMLearnHelpLink {
	id: string;
	_transient: any;
	isDefault: boolean;
	localizedHelpLink: AEMLearnLocalizedHelpLink[];
}

export interface AEMLearnJob {
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

export interface AEMLearnLearnerAttemptInfo {
	id: string;
	_transient: any;
	attemptsFinishedCount: number;
	currentAttemptNumber: number;
	lastAttemptEndTime: string;
}

export interface AEMLearnLearningObject {
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
	catalogLabels: AEMLearnCatalogLables[];
	localizedMetadata: AEMLearnLocalizationMetadata[];
	prequisiteConstraints: AEMLearnPrerequisiteContraints[];
	rating: object;
	sections: AEMLearnSections[];
	authors: AEMLearnUser[];
	enrollment: AEMLearnLearningObjectInstanceEnrollment;
	instances: AEMLearnLearningObjectInstance[];
	prerequisiteLOs: AEMLearnLearningObject[];
	skills: AEMLearnLearningObjectSkill[];
	subLOs: AEMLearnLearningObject[];
	supplementaryLOs: AEMLearnLearningObject[];
	supplementaryResources: AEMLearnResource[];
}

export interface AEMLearnLearningObjectInstance {
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
	localizedMetadata: AEMLearnLocalizationMetadata[];
	badge: AEMLearnBadge;
	l1FeedbackInfo: AEMLearnFeedbackInfo;
	learningObject: AEMLearnLearningObject;
	loResources: AEMLearnLearningObjectResource[];
	subLoInstances: AEMLearnLearningObjectInstance[];
}

export interface AEMLearnLearningObjectInstanceEnrollment {
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
	learner: AEMLearnUser;
	learnerBadge: AEMLearnUserBadge;
	learningObject: AEMLearnLearningObject;
	loInstance: AEMLearnLearningObjectInstance;
	loResourceGrades: AEMLearnLearningObjectResourceGrade[];
}

export interface AEMLearnLearningObjectResource {
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
	localizedMetadata: AEMLearnLocalizationMetadata[];
	multipleAttempt: object;
	learningObject: AEMLearnLearningObject;
	loInstance: AEMLearnLearningObjectInstance;
	resources: AEMLearnResource[];
}

export interface AEMLearnLearningObjectResourceGrade {
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
	loResource: AEMLearnLearningObjectResource;
}

export interface AEMLearnLearningObjectSkill {
	id: string;
	_transient: any;
	credits: number;
	learningObjectId: string;
	type: string;
	learningObject: AEMLearnLearningObject;
	skillLevel: AEMLearnSkillLevel;
}

export interface AEMLearnLoInstanceSummary {
	id: string;
	_transient: any;
	asOf: string;
	completionCount: number;
	enrollmentCount: number;
	seatLimit: number;
	type: string;
	waitlistCount: number;
}

export interface AEMLearnLocalizationContentdata {
	id: string;
	_transient: any;
	contentSources: string[];
	contentType: string;
	contentUrl: string;
	locale: string;
	thumbnailUrl: string;
}

export interface AEMLearnLocalizationMetadata {
	id: string;
	_transient: any;
	description: string;
	locale: string;
	name: string;
	overview: string;
	richTextOverview: string;
	type: string;
}

export interface AEMLearnLocalizedHelpLink {
	id: string;
	_transient: any;
	link: string;
	locale: string;
	name: string;
}

export interface AEMLearnMinimalAccount {
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
	accountTerminologies: AEMLearnAccountTerminology[];
}

export interface AEMLearnMultipleAttempt {
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

export interface AEMLearnNote {
	id: string;
	_transient: any;
	marker: string;
	text: string;
	type: string;
	loResource: AEMLearnLearningObjectResource;
}

export interface AEMLearnPoll {
	id: string;
	_transient: any;
	dateCreated: string;
	optionId: number;
}

export interface AEMLearnPost {
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
	createdBy: AEMLearnUser;
	parent: AEMLearnBoard;
}

export interface AEMLearnPrerequisiteContraints {
	id: string;
	_transient: any;
	mandatory: boolean;
	prerequisiteLOId: string;
}

export interface AEMLearnRating {
	id: string;
	_transient: any;
	averageRating: number;
	ratingsCount: number;
}

export interface AEMLearnRecommendation {
	id: string;
	_transient: any;
	externalSkills: object;
	internalSkills: object;
	reason: string[];
	type: string;
	learningObject: AEMLearnLearningObject;
}

export interface AEMLearnReply {
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
	createdBy: AEMLearnUser;
}

export interface AEMLearnReportAbuse {
	id: string;
	_transient: any;
	reason: string;
}

export interface AEMLearnResource {
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
	room: AEMLearnRoom;
}

export interface AEMLearnRoom {
	id: string;
	_transient: any;
	roomInfo: string;
	roomName: string;
	seatLimit: number;
	url: string;
}

export interface AEMLearnSearchResult {
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
	snippets: AEMLearnSearchSnippet[];
	model: AEMLearnLearningObject|AEMLearnCatalog|AEMLearnSkill|AEMLearnBadge|AEMLearnBoard|AEMLearnPost|AEMLearnUser;
}

export interface AEMLearnSearchSnippet {
	id: string;
	_transient: any;
	snippet: string;
	snippetType: string;
}

export interface AEMLearnSections {
	id: string;
	_transient: any;
	loIds: string[];
	mandatory: boolean;
	mandatoryLOCount: number;
	sectionId: string;
	localizedMetadata: AEMLearnLocalizationMetadata[];
}

export interface AEMLearnSkill {
	id: string;
	_transient: any;
	description: string;
	name: string;
	state: string;
	type: string;
	levels: AEMLearnSkillLevel[];
}

export interface AEMLearnSkillInterestSearchResult {
	id: string;
	_transient: any;
	name: string;
	type: string;
}

export interface AEMLearnSkillLevel {
	id: string;
	_transient: any;
	level: string;
	maxCredits: number;
	name: string;
	type: string;
	badge: AEMLearnBadge;
	skill: AEMLearnSkill;
}

export interface AEMLearnSocialProfile {
	id: string;
	_transient: any;
	commentCount: number;
	followerCount: number;
	postCount: number;
	socialPoints: number;
	user: object;
	windowedStats: object;
}

export interface AEMLearnSocialResource {
	id: string;
	_transient: any;
	contentType: string;
	data: string;
	duration: number;
	sourceUrl: string;
	state: string;
}

export interface AEMLearnStory {
	id: string;
	_transient: any;
	dateCreated: string;
	state: string;
	title: string;
	createdBy: AEMLearnUser;
}

export interface AEMLearnTimeZone {
	id: string;
	_transient: any;
	name: string;
	timeZoneCode: string;
	utcOffset: number;
	utcOffsetCode: string;
	zoneId: string;
}

export interface AEMLearnUploadInfo {
	id: string;
	_transient: any;
	awsKey: string;
	bucket: string;
	key: string;
	region: string;
}

export interface AEMLearnUser {
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
	account: AEMLearnAccount;
	manager: AEMLearnUser;
}

export interface AEMLearnUserBadge {
	id: string;
	_transient: any;
	assertionUrl: string;
	dateAchieved: string;
	expiryDate: string;
	modelType: string;
	type: string;
	badge: AEMLearnBadge;
	learner: AEMLearnUser;
	model: AEMLearnLearningObject|AEMLearnSkillLevel;
}

export interface AEMLearnUserCalendar {
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
	containerLO: AEMLearnLearningObject;
	course: AEMLearnLearningObject;
	instructors: AEMLearnUser[];
	room: AEMLearnRoom;
}

export interface AEMLearnUserGroup {
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

export interface AEMLearnUserGroupSearchResult {
	id: string;
	_transient: any;
	name: string;
	type: string;
}

export interface AEMLearnUserNotification {
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

export interface AEMLearnUserSetting {
	id: string;
	_transient: any;
	type: string;
	dndSetting: object;
}

export interface AEMLearnUserSkill {
	id: string;
	_transient: any;
	dateAchieved: string;
	dateCreated: string;
	pointsEarned: number;
	type: string;
	learnerBadge: AEMLearnUserBadge;
	learningObject: AEMLearnLearningObject[];
	skill: AEMLearnSkill;
	skillLevel: AEMLearnSkillLevel;
	user: AEMLearnUser;
}

export interface AEMLearnUserSkillInterest {
	id: string;
	_transient: any;
	dateCreated: string;
	source: string;
	type: string;
	skill: AEMLearnSkill;
	user: AEMLearnUser;
	userSkills: AEMLearnUserSkill[];
}

export interface AEMLearnUserStat {
	id: string;
	_transient: any;
	postCount: number;
}

export interface AEMLearnUserStat {
	id: string;
	_transient: any;
	postCount: number;
}

export interface AEMLearnResourceIdentifier {
	id: string;
	_transient: any;
}

export interface JsonApiResponse {
	account: AEMLearnAccount;
	accountList: AEMLearnAccount[];
	accountTerminology: AEMLearnAccountTerminology;
	accountTerminologyList: AEMLearnAccountTerminology[];
	adminAnnouncement: AEMLearnAdminAnnouncement;
	adminAnnouncementList: AEMLearnAdminAnnouncement[];
	announcement: AEMLearnAnnouncement;
	announcementList: AEMLearnAnnouncement[];
	badge: AEMLearnBadge;
	badgeList: AEMLearnBadge[];
	board: AEMLearnBoard;
	boardList: AEMLearnBoard[];
	catalog: AEMLearnCatalog;
	catalogList: AEMLearnCatalog[];
	catalogLables: AEMLearnCatalogLables;
	catalogLablesList: AEMLearnCatalogLables[];
	comment: AEMLearnComment;
	commentList: AEMLearnComment[];
	counts: AEMLearnCounts;
	countsList: AEMLearnCounts[];
	data: AEMLearnData;
	dataList: AEMLearnData[];
	discussionPost: AEMLearnDiscussionPost;
	discussionPostList: AEMLearnDiscussionPost[];
	dnd: AEMLearnDnd;
	dndList: AEMLearnDnd[];
	externalProfile: AEMLearnExternalProfile;
	externalProfileList: AEMLearnExternalProfile[];
	feedback: AEMLearnFeedback;
	feedbackList: AEMLearnFeedback[];
	feedbackAnswer: AEMLearnFeedbackAnswer;
	feedbackAnswerList: AEMLearnFeedbackAnswer[];
	feedbackInfo: AEMLearnFeedbackInfo;
	feedbackInfoList: AEMLearnFeedbackInfo[];
	feedbackQuestion: AEMLearnFeedbackQuestion;
	feedbackQuestionList: AEMLearnFeedbackQuestion[];
	filterPanelSetting: AEMLearnFilterPanelSetting;
	filterPanelSettingList: AEMLearnFilterPanelSetting[];
	gamificationLevel: AEMLearnGamificationLevel;
	gamificationLevelList: AEMLearnGamificationLevel[];
	helpLink: AEMLearnHelpLink;
	helpLinkList: AEMLearnHelpLink[];
	job: AEMLearnJob;
	jobList: AEMLearnJob[];
	learnerAttemptInfo: AEMLearnLearnerAttemptInfo;
	learnerAttemptInfoList: AEMLearnLearnerAttemptInfo[];
	learningObject: AEMLearnLearningObject;
	learningObjectList: AEMLearnLearningObject[];
	learningObjectInstance: AEMLearnLearningObjectInstance;
	learningObjectInstanceList: AEMLearnLearningObjectInstance[];
	learningObjectInstanceEnrollment: AEMLearnLearningObjectInstanceEnrollment;
	learningObjectInstanceEnrollmentList: AEMLearnLearningObjectInstanceEnrollment[];
	learningObjectResource: AEMLearnLearningObjectResource;
	learningObjectResourceList: AEMLearnLearningObjectResource[];
	learningObjectResourceGrade: AEMLearnLearningObjectResourceGrade;
	learningObjectResourceGradeList: AEMLearnLearningObjectResourceGrade[];
	learningObjectSkill: AEMLearnLearningObjectSkill;
	learningObjectSkillList: AEMLearnLearningObjectSkill[];
	loInstanceSummary: AEMLearnLoInstanceSummary;
	loInstanceSummaryList: AEMLearnLoInstanceSummary[];
	localizationContentdata: AEMLearnLocalizationContentdata;
	localizationContentdataList: AEMLearnLocalizationContentdata[];
	localizationMetadata: AEMLearnLocalizationMetadata;
	localizationMetadataList: AEMLearnLocalizationMetadata[];
	localizedHelpLink: AEMLearnLocalizedHelpLink;
	localizedHelpLinkList: AEMLearnLocalizedHelpLink[];
	minimalAccount: AEMLearnMinimalAccount;
	minimalAccountList: AEMLearnMinimalAccount[];
	multipleAttempt: AEMLearnMultipleAttempt;
	multipleAttemptList: AEMLearnMultipleAttempt[];
	note: AEMLearnNote;
	noteList: AEMLearnNote[];
	poll: AEMLearnPoll;
	pollList: AEMLearnPoll[];
	post: AEMLearnPost;
	postList: AEMLearnPost[];
	prerequisiteContraints: AEMLearnPrerequisiteContraints;
	prerequisiteContraintsList: AEMLearnPrerequisiteContraints[];
	rating: AEMLearnRating;
	ratingList: AEMLearnRating[];
	recommendation: AEMLearnRecommendation;
	recommendationList: AEMLearnRecommendation[];
	reply: AEMLearnReply;
	replyList: AEMLearnReply[];
	reportAbuse: AEMLearnReportAbuse;
	reportAbuseList: AEMLearnReportAbuse[];
	resource: AEMLearnResource;
	resourceList: AEMLearnResource[];
	room: AEMLearnRoom;
	roomList: AEMLearnRoom[];
	searchResult: AEMLearnSearchResult;
	searchResultList: AEMLearnSearchResult[];
	searchSnippet: AEMLearnSearchSnippet;
	searchSnippetList: AEMLearnSearchSnippet[];
	sections: AEMLearnSections;
	sectionsList: AEMLearnSections[];
	skill: AEMLearnSkill;
	skillList: AEMLearnSkill[];
	skillInterestSearchResult: AEMLearnSkillInterestSearchResult;
	skillInterestSearchResultList: AEMLearnSkillInterestSearchResult[];
	skillLevel: AEMLearnSkillLevel;
	skillLevelList: AEMLearnSkillLevel[];
	socialProfile: AEMLearnSocialProfile;
	socialProfileList: AEMLearnSocialProfile[];
	socialResource: AEMLearnSocialResource;
	socialResourceList: AEMLearnSocialResource[];
	story: AEMLearnStory;
	storyList: AEMLearnStory[];
	timeZone: AEMLearnTimeZone;
	timeZoneList: AEMLearnTimeZone[];
	uploadInfo: AEMLearnUploadInfo;
	uploadInfoList: AEMLearnUploadInfo[];
	user: AEMLearnUser;
	userList: AEMLearnUser[];
	userBadge: AEMLearnUserBadge;
	userBadgeList: AEMLearnUserBadge[];
	userCalendar: AEMLearnUserCalendar;
	userCalendarList: AEMLearnUserCalendar[];
	userGroup: AEMLearnUserGroup;
	userGroupList: AEMLearnUserGroup[];
	userGroupSearchResult: AEMLearnUserGroupSearchResult;
	userGroupSearchResultList: AEMLearnUserGroupSearchResult[];
	userNotification: AEMLearnUserNotification;
	userNotificationList: AEMLearnUserNotification[];
	userSetting: AEMLearnUserSetting;
	userSettingList: AEMLearnUserSetting[];
	userSkill: AEMLearnUserSkill;
	userSkillList: AEMLearnUserSkill[];
	userSkillInterest: AEMLearnUserSkillInterest;
	userSkillInterestList: AEMLearnUserSkillInterest[];
	userStat: AEMLearnUserStat;
	userStatList: AEMLearnUserStat[];
	resourceIdentifier: AEMLearnResourceIdentifier;
	resourceIdentifierList: AEMLearnResourceIdentifier[];
	links?: JsonApiResponseLinks;
}

export interface JsonApiResponseLinks {
    self: string;
    next?: string;
    prev?: string;
}