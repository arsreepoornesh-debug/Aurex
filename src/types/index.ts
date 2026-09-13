export type Role = 'OWNER' | 'MANAGER' | 'RECEPTIONIST';

export type ClientStatus =
  | 'LEAD'
  | 'CONSULTATION'
  | 'ASSESSMENT_BOOKED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_HOLD'
  | 'EXPIRED'
  | 'COMPLETED';

export type ServiceType = 'SEMI_PRIVATE' | 'PREMIUM' | 'ASSESSMENT' | 'CONSULTATION';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';

export type AttendanceStatus =
  | 'PENDING'
  | 'PRESENT'
  | 'ABSENT'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type PackageStatus = 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'ON_HOLD';

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CASH';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED';

export type LeadStage =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'CONSULTATION'
  | 'ASSESSMENT_BOOKED'
  | 'ASSESSMENT_COMPLETED'
  | 'PACKAGE_OFFERED'
  | 'CONVERTED'
  | 'ACTIVE'
  | 'RENEWAL'
  | 'LOST';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ClientData {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  email?: string | null;
  dob?: string | Date | null;
  gender?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  registrationDate: string | Date;
  referralSource: string;
  status: ClientStatus;
  assignedSpecialistId?: string | null;
  assignedSpecialist?: {
    id: string;
    name: string;
    specialization: string;
    colorCode: string;
  } | null;
}

export interface AssessmentFormData {
  healthScreening: {
    parQAnswer: 'YES' | 'NO';
    parQDetails?: string;
    medicalConditions: string[];
    redFlags: string[];
    physicianClearanceRequired: boolean;
    physicianClearanceObtained: boolean;
  };
  medicalHistory: {
    surgeries: string;
    injuries: string;
    currentMedications: string;
    painAreas: string[];
  };
  goals: {
    primaryGoal: string;
    secondaryGoals: string[];
    timelineWeeks: number;
    sportsOrActivities: string;
  };
  baselineMetrics: {
    heightCm: number;
    weightKg: number;
    bmi: number;
    restingHeartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    bodyFatPercent?: number;
    spo2?: number;
  };
  functionalMovement: {
    overheadSquatScore: number; // 1 to 3
    hurdleStepScore: number;
    shoulderMobilityScore: number;
    activeStraightLegRaise: number;
    trunkStabilityPushup: number;
    rotaryStabilityScore: number;
    postureNotes: string;
  };
  cardioStrength: {
    submaxCardioTest: string;
    estimatedVo2Max?: number;
    gripStrengthKg?: number;
    pushupCount?: number;
    plankHoldSeconds?: number;
  };
  clinicalNotes: {
    findings: string;
    exercisePrescription: string;
    contraindications: string;
    nextReviewDate?: string;
  };
}
