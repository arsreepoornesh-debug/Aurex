import { Role } from '@/types';
import { NextResponse } from 'next/server';

export const PERMISSIONS = {
  // Financials & Pricing (OWNER + MANAGER can view in full, RECEPTIONIST is BLOCKED)
  VIEW_REVENUE: ['OWNER', 'MANAGER'] as Role[],
  VIEW_REPORTS: ['OWNER', 'MANAGER'] as Role[],
  MANAGE_MASTER_PACKAGES: ['OWNER', 'MANAGER'] as Role[],
  VIEW_MASTER_PACKAGE_PRICES: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  
  // Staff & Specialists Management
  MANAGE_STAFF: ['OWNER'] as Role[], // Only OWNER can delete/create staff
  MANAGE_SPECIALISTS: ['OWNER', 'MANAGER'] as Role[],
  DELETE_CLIENTS: ['OWNER'] as Role[],
  
  // Operations (Staff)
  VIEW_CLIENTS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_CLIENTS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_BOOKINGS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MARK_ATTENDANCE: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'SPECIALIST'] as Role[],
  COMPLETE_SESSION: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'SPECIALIST'] as Role[],
  RECORD_PAYMENT: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_LEADS: ['OWNER', 'MANAGER', 'RECEPTIONIST'] as Role[],
  MANAGE_ASSESSMENTS: ['OWNER', 'MANAGER', 'SPECIALIST'] as Role[],
  
  // Specialist Views
  SPECIALIST_DASHBOARD: ['SPECIALIST', 'OWNER', 'MANAGER'] as Role[],
  
  // Client Portal
  CLIENT_PORTAL: ['CLIENT', 'OWNER'] as Role[],
};

export function hasPermission(userRole: Role | string | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole as Role);
}

export function canViewRevenue(role?: string): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function canViewFinancials(role?: string): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function canViewReports(role?: string): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function canManageStaff(role?: string): boolean {
  return role === 'OWNER';
}

export function canDeleteStaff(role?: string): boolean {
  return role === 'OWNER';
}

export function canManageMasterPackages(role?: string): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

export function forbiddenResponse(message = 'Access Denied: You do not have permission to access this resource') {
  return NextResponse.json({ error: message }, { status: 403 });
}
