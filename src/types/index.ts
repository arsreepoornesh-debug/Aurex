export type Role = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'SPECIALIST' | 'CLIENT';

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

export type PackageStatus = 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'ON_HOLD' | 'FROZEN';

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CASH';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED';

export type LeadStage =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'CONSULTATION'
  | 'ASSESSMENT_BOOKED'
  | 'ASSESSMENT_COMPLETED'
  | 'PACKAGE_OFFERED'
  | 'JOINED'
  | 'ACTIVE'
  | 'RENEWAL'
  | 'LOST';

export type LeadSource =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'WHATSAPP'
  | 'WEBSITE'
  | 'GOOGLE'
  | 'REFERRAL'
  | 'WALK_IN'
  | 'OTHER';

export type LeadConvertibility = 'HOT' | 'WARM' | 'COLD';

export type AssessmentType = 'INITIAL' | 'REASSESSMENT' | 'PROGRESS_REVIEW';

export type DocumentType =
  | 'MEDICAL_CLEARANCE'
  | 'REFERRAL'
  | 'CONSENT_FORM'
  | 'PAR_Q'
  | 'OTHER';

export type ConsentStatus = 'PENDING' | 'ACKNOWLEDGED' | 'SIGNED';

export type FreezeStatus = 'ACTIVE' | 'LIFTED';

export type AccessPermission = 'STAFF_ONLY' | 'OWNER_ONLY';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export type InquiryResponse =
  | 'CALL_NOT_PICKED'
  | 'NOT_REACHABLE'
  | 'NUMBER_SWITCHED_OFF'
  | 'INVALID_NUMBER'
  | 'OUT_OF_STATION'
  | 'LOCATION_TOO_FAR'
  | 'PRICE_TOO_HIGH'
  | 'JOINED_ANOTHER_CENTRE'
  | 'TIMING_ISSUE'
  | 'NOT_INTERESTED'
  | 'WILL_JOIN_LATER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialistId?: string | null;
  clientId?: string | null;
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
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
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
  packages?: any[];
  bookings?: any[];
  attendances?: any[];
  payments?: any[];
  assessments?: any[];
  notes?: any[];
  documents?: any[];
  consents?: any[];
  packageFreezes?: any[];
}
