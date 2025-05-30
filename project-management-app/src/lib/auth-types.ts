// Define user roles for role-based access control
export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  FIELD_TECHNICIAN = 'field_technician',
  INVENTORY_MANAGER = 'inventory_manager',
  CLIENT = 'client',
}

// Define permissions for each role
export interface RolePermissions {
  canViewProjects: boolean;
  canEditProjects: boolean;
  canCreateProjects: boolean;
  canDeleteProjects: boolean;
  canViewTasks: boolean;
  canEditTasks: boolean;
  canAssignTasks: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canViewReports: boolean;
  canCreateReports: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessAdminPanel: boolean;
}

// Define the permission set for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canViewProjects: true,
    canEditProjects: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canViewTasks: true,
    canEditTasks: true,
    canAssignTasks: true,
    canViewInventory: true,
    canEditInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canAccessAdminPanel: true,
  },
  [UserRole.PROJECT_MANAGER]: {
    canViewProjects: true,
    canEditProjects: true,
    canCreateProjects: true,
    canDeleteProjects: false,
    canViewTasks: true,
    canEditTasks: true,
    canAssignTasks: true,
    canViewInventory: true,
    canEditInventory: false,
    canViewReports: true,
    canCreateReports: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessAdminPanel: false,
  },
  [UserRole.FIELD_TECHNICIAN]: {
    canViewProjects: true,
    canEditProjects: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewTasks: true,
    canEditTasks: true,
    canAssignTasks: false,
    canViewInventory: true,
    canEditInventory: false,
    canViewReports: false,
    canCreateReports: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessAdminPanel: false,
  },
  [UserRole.INVENTORY_MANAGER]: {
    canViewProjects: true,
    canEditProjects: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewTasks: true,
    canEditTasks: false,
    canAssignTasks: false,
    canViewInventory: true,
    canEditInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessAdminPanel: false,
  },
  [UserRole.CLIENT]: {
    canViewProjects: true,
    canEditProjects: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewTasks: true,
    canEditTasks: false,
    canAssignTasks: false,
    canViewInventory: false,
    canEditInventory: false,
    canViewReports: true,
    canCreateReports: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessAdminPanel: false,
  },
};

// Define the user profile type
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

// Helper function to check if a user has a specific permission
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return rolePermissions[role][permission];
}
