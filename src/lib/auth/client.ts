'use client';

import type { User } from '@/types/user';
import { authApi, type LoginRequest } from '@/lib/api/auth';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

// This is no longer used - user data comes from API

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    return { error: 'User registration is disabled. Only admins can create users.' };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const { email, password } = params;
      
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        // Store the JWT token
        localStorage.setItem('auth-token', response.data.token);
        
        // Store complete user data
        const userData = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          avatar: response.data.user.avatar,
          bankAccount: response.data.user.bankAccount,
          about: response.data.user.about,
          address: response.data.user.address,
          dateOfBirth: response.data.user.dateOfBirth,
          role: response.data.user.role || 'USER',
          status: response.data.user.status,
          isActive: response.data.user.isActive,
          lastLoginAt: response.data.user.lastLoginAt,
          createdAt: response.data.user.createdAt,
          updatedAt: response.data.user.updatedAt,
          createdBy: response.data.user.createdBy,
          updatedBy: response.data.user.updatedBy,
        };
        localStorage.setItem('user-data', JSON.stringify(userData));
        
        return {};
      } else {
        return { error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Login failed. Please check your credentials.' 
      };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        return { data: null };
      }

      // Try to get current user from API
      const response = await authApi.getCurrentUser(token);
      
      if (response.success && response.data) {
        // Use all fields returned by the API
        const userData = {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          avatar: response.data.avatar,
          bankAccount: response.data.bankAccount,
          about: response.data.about,
          address: response.data.address,
          dateOfBirth: response.data.dateOfBirth,
          role: response.data.role || 'USER',
          status: response.data.status,
          isActive: response.data.isActive,
          lastLoginAt: response.data.lastLoginAt,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          createdBy: response.data.createdBy,
          updatedBy: response.data.updatedBy,
        };
        return { data: userData };
      } else {
        // If API call fails, try to get from localStorage
        const userData = localStorage.getItem('user-data');
        if (userData) {
          const user = JSON.parse(userData);
          return { 
            data: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              avatar: user.avatar,
              bankAccount: user.bankAccount,
              about: user.about,
              address: user.address,
              dateOfBirth: user.dateOfBirth,
              role: user.role || 'USER',
              status: user.status,
              isActive: user.isActive,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              createdBy: user.createdBy,
              updatedBy: user.updatedBy,
            }
          };
        }
        return { data: null };
      }
    } catch (error) {
      console.error('Get user error:', error);
      
      // Fallback to localStorage
      const userData = localStorage.getItem('user-data');
      if (userData) {
        const user = JSON.parse(userData);
        return { 
          data: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            bankAccount: user.bankAccount,
            about: user.about,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            role: user.role || 'USER',
            status: user.status,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
          }
        };
      }
      
      return { data: null };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    return {};
  }
}

export const authClient = new AuthClient();
