"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { UserProfile, UserRole, hasPermission } from './auth-types';
import { createAuditLog, AuditAction, AuditResourceType } from './auditLogger';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            throw profileError;
          }
          
          if (profileData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              role: profileData.role as UserRole || UserRole.FIELD_TECHNICIAN,
              avatarUrl: profileData.avatar_url,
              phoneNumber: profileData.phone_number,
              department: profileData.department,
              createdAt: profileData.created_at,
              lastLogin: profileData.last_login,
            });
            
            // Update last login time
            await supabase
              .from('user_profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize authentication'));
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile after sign in
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              role: profileData.role as UserRole || UserRole.FIELD_TECHNICIAN,
              avatarUrl: profileData.avatar_url,
              phoneNumber: profileData.phone_number,
              department: profileData.department,
              createdAt: profileData.created_at,
              lastLogin: profileData.last_login,
            });
            
            // Log the sign in event
            await createAuditLog({
              action: AuditAction.LOGIN,
              resourceType: AuditResourceType.USER,
              resourceId: session.user.id,
              details: { method: 'email' },
            });
            
            // Update last login time
            await supabase
              .from('user_profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // User profile is fetched by the auth state change listener
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        // Log the sign out event
        await createAuditLog({
          action: AuditAction.LOGOUT,
          resourceType: AuditResourceType.USER,
          resourceId: user.id,
          details: {},
        });
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update profile in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatarUrl,
          phone_number: updates.phoneNumber,
          department: updates.department,
          // Role can only be updated by admins, handled separately
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local user state
      setUser({
        ...user,
        ...updates,
      });
      
      // Log the profile update
      await createAuditLog({
        action: AuditAction.UPDATE,
        resourceType: AuditResourceType.USER,
        resourceId: user.id,
        details: { updates },
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has a specific permission
  const checkPermission = (permission: string) => {
    if (!user) return false;
    return hasPermission(user.role, permission as any);
  };
  
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasPermission: checkPermission,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Higher-order component to protect routes based on permissions
export function withPermission(Component: React.ComponentType, requiredPermission: string) {
  return function ProtectedRoute(props: any) {
    const { user, hasPermission, loading } = useAuth();
    
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    
    if (!user || !hasPermission(requiredPermission)) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
