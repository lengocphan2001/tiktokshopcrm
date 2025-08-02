'use client';

import type { User } from '@/types/user';
import { authApi, type LoginRequest } from '@/lib/api/auth';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
  role: 'USER',
} satisfies User;

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
        
        // Store user data with role
        const userData = {
          ...response.data.user,
          role: response.data.user.role || 'USER', // Ensure role is set
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
        const userData = {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role || 'USER', // Ensure role is set
          avatar: '/assets/avatar.png', // Default avatar
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
              role: user.role || 'USER', // Ensure role is set
              avatar: '/assets/avatar.png',
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
            role: user.role || 'USER', // Ensure role is set
            avatar: '/assets/avatar.png',
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
