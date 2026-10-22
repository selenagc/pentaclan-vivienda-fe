export interface FamilyMember {
  id?: number;
  personId?: string | null;
  fullName: string;
  relationship: string;
  documentNo?: string | null;
  documentIssuedIn?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  age?: number | null;
  occupation?: string | null;
  hasDisability: boolean;
  disabilityType?: string | null;
  disabilityDocument?: string | null;
}

export interface EvaluationQuestion {
  id: number;
  questionText: string;
  category?: string | null;
  active: boolean;
}

export interface DiagnosticAnswer {
  evaluationQuestionId: number;
  question?: EvaluationQuestion;
  answerBoolean?: boolean | null;
  score?: string | null;
}

export interface WaterConsumptionHabit {
  waterSource?: string | null;
  waterSourceOther?: string | null;
  containerClean?: boolean | null;
  containerStatus?: string | null;
  waterTreatment?: string | null;
  otherDetails?: string | null;
}

export interface HousingHygiene {
  greywaterDisposal?: string | null;
  garbageDisposal?: string | null;
  roomsCleanlinessStatus?: string | null;
  yardCleanlinessStatus?: string | null;
}

export interface HealthCondition {
  prevalentDiseases?: string | null;
  healthCareAction?: string | null;
}

export interface LandAccessibility {
  slopePercentage?: number | null;
  pedestrianMinutes?: number | null;
  abcStandard?: string | null;
  accessibilityType?: string | null;
  landCondition?: string | null;
}

export interface BasicUtility {
  waterAccess?: string | null;
  electricityService?: string | null;
  sharedBathroom?: boolean | null;
  privateBathroom?: boolean | null;
  bathroomType?: string | null;
  sharedKitchen?: boolean | null;
  privateKitchen?: boolean | null;
  adequateKitchen?: boolean | null;
  kitchenType?: string | null;
}

export interface HousingCharacteristic {
  housingTypology?: string | null;
  tenureStatus?: string | null;
  observations?: string | null;
}

export interface ConstructionElement {
  id?: number;
  constructionNumber: number;
  usageType?: string | null;
  foundationMaterial?: string | null;
  foundationState?: string | null;
  wallsMaterial?: string | null;
  wallsState?: string | null;
  roofMaterial?: string | null;
  roofState?: string | null;
  exteriorPlasterMaterial?: string | null;
  exteriorPlasterState?: string | null;
  interiorPlasterMaterial?: string | null;
  interiorPlasterState?: string | null;
  ceilingPlasterMaterial?: string | null;
  ceilingPlasterState?: string | null;
  floorsMaterial?: string | null;
  floorsState?: string | null;
  doorsMaterial?: string | null;
  doorsState?: string | null;
  windowsMaterial?: string | null;
  windowsState?: string | null;
  electricalInstallation?: string | null;
  electricalInstallationState?: string | null;
  canBeImproved: number;
  cannotBeImproved: number;
  noImprovementNeeded: number;
  observations?: string | null;
}

export interface DiagnosticPhoto {
  id?: number;
  photoType: string;
  url: string;
  description?: string | null;
}

export interface DiagnosticRecord {
  id: string;
  applicationId: string;
  formNo?: string | null;
  evaluationDate: string;
  technicalUserId?: string | null;
  technicalUserName?: string | null;
  technicalCompletedAt?: string | null;
  socialUserId?: string | null;
  socialUserName?: string | null;
  socialCompletedAt?: string | null;

  // Propuesta técnica
  requiresImprovement: boolean;
  requiresExpansion: boolean;
  requiresRenovation: boolean;
  roomsToImprove?: string | null;
  bedroomSuggestion?: string | null;
  livingRoomSuggestion?: string | null;
  kitchenSuggestion?: string | null;
  bathroomSuggestion?: string | null;
  generalObservations?: string | null;

  // Sección Social
  familyMembers: FamilyMember[];
  answers: DiagnosticAnswer[];
  constructionKnowledgeObservations?: string | null;
  waterHabits?: WaterConsumptionHabit | null;
  hygiene?: HousingHygiene | null;
  health?: HealthCondition | null;

  // Sección Técnica
  landAccessibility?: LandAccessibility | null;
  basicUtilities?: BasicUtility | null;
  housingCharacteristics?: HousingCharacteristic | null;
  constructionElements: ConstructionElement[];
  photos: DiagnosticPhoto[];

  createdAt: string;
  updatedAt: string;
}

export interface TechnicalDiagnosticInput {
  formNo?: string | null;
  evaluationDate?: string;
  requiresImprovement?: boolean;
  requiresExpansion?: boolean;
  requiresRenovation?: boolean;
  roomsToImprove?: string | null;
  bedroomSuggestion?: string | null;
  livingRoomSuggestion?: string | null;
  kitchenSuggestion?: string | null;
  bathroomSuggestion?: string | null;
  generalObservations?: string | null;
  landAccessibility?: LandAccessibility | null;
  basicUtilities?: BasicUtility | null;
  housingCharacteristics?: HousingCharacteristic | null;
  constructionElements?: ConstructionElement[];
  photos?: DiagnosticPhoto[];
  isCompleted?: boolean;
}

export interface SocialDiagnosticInput {
  formNo?: string | null;
  evaluationDate?: string;
  familyMembers?: FamilyMember[];
  answers?: {
    evaluationQuestionId: number;
    answerBoolean?: boolean | null;
    score?: string | null;
  }[];
  constructionKnowledgeObservations?: string | null;
  waterHabits?: WaterConsumptionHabit | null;
  hygiene?: HousingHygiene | null;
  health?: HealthCondition | null;
  isCompleted?: boolean;
}
