import { Role } from '@/types';

export const PERMISSIONS = {
  // Financials & Pricing (OWNER ONLY)
  VIEW_REVENUE: ['OWNER'] as Role[],
  VIEW_REPORTS: ['OWNER'] as Role[],
  MANAGE_MASTER_PACKAGES: ['OWNER'] as Role[],
  VIEW_MASTER_PACKAGE_PRICES: ['OWNER'] as Role[],
  
  // Staff & Specialists
  MANAGE_STAFF: ['OWNER'] as Role[],
  MANAGE_SPECIALISTS: ['OWNER', 'MANAGER'] as Role[],
  DELETE_RECORDS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  
  // Operations (Everyone)
  VIEW_CLIENTS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_CLIENTS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_BOOKINGS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MARK_ATTENDANCE: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  COMPLETE_SESSION: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  RECORD_PAYMENT: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_LEADS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_ASSESSMENTS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
};

export function hasPermission(userRole: Role | string | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole as Role);
}

export function canViewRevenue(role?: string): boolean {
  return role === 'OWNER';
}

export function canViewReports(role?: string): boolean {
  return role === 'OWNER';
}

export function canManageStaff(role?: string): boolean {
  return role === 'OWNER';
}

export function canManageMasterPackages(role?: string): boolean {
  return role === 'OWNER';
}

