import { supabase } from './supabaseClient';

// Enum for audit actions
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  ASSIGN = 'assign',
  COMPLETE = 'complete',
  APPROVE = 'approve',
  REJECT = 'reject',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  EXPORT = 'export',
  IMPORT = 'import'
}

// Enum for resource types
export enum AuditResourceType {
  PROJECT = 'project',
  PHASE = 'phase',
  TASK = 'task',
  CUSTOMER = 'customer',
  USER = 'user',
  LOCATION = 'location',
  PROJECT_PHASE = 'project_phase',
  PROJECT_TASK = 'project_task',
  INVENTORY_ITEM = 'inventory_item',
  STOCK_MOVEMENT = 'stock_movement',
  REPORT = 'report',
  FILE = 'file',
  SYSTEM = 'system',
  PERMISSION = 'permission',
  MATERIAL = 'material'
}

// Original logAudit function
export async function logAudit(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: ipAddress
      });

    if (error) {
      console.error('Failed to log audit:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

// New createAuditLog function that matches the expected signature
export async function createAuditLog(
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    // Get the current user ID - in a real app, you'd get this from auth context
    // For now, we'll use a placeholder
    const userId = 'system'; // Placeholder for actual user ID
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: ipAddress || '0.0.0.0'
      });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
