import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSessions from 'expo-auth-session';

import { GITHUB_CLIENT_ID } from '@env';

import { api } from '../services/api';

const SCOPE = 'read:user';
const USER_STORAGE = '@dowhile:user';
const TOKEN_STORAGE = '@dowhile:token';

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
}

type AuthContextData = {
  user: User | null;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

type AuthProviderProps = {
  children: React.ReactNode
}

type AuthResponse = {
  token: string;
  user: User;
}

type AuthorizationResponse = {
  params: {
    code?: string;
    error?: string;
  },
  type?: string;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isSigningIn, setisSigningIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  async function signIn() {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${SCOPE}`;

    const authSessionResponse = await AuthSessions.startAsync({ authUrl }) as AuthorizationResponse;
    
    if(
        authSessionResponse.type === 'success' 
        && authSessionResponse.params.error !== 'access_denied'
      ) {
      try {      
        const authResponse = await api.post<AuthResponse>('authenticate', {
          code: authSessionResponse.params.code,
        });

        const { user, token } = authResponse.data;

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        await AsyncStorage.multiSet([
          [USER_STORAGE, JSON.stringify(user)],
          [TOKEN_STORAGE, token]
        ]);
        
        setUser(user);
      } catch (error) {
        console.log(error);
      } finally {
        setisSigningIn(false);
      }
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove([USER_STORAGE, TOKEN_STORAGE]);
    setUser(null);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const [user, token] = await AsyncStorage.multiGet([
        USER_STORAGE, 
        TOKEN_STORAGE
      ]);  

      if(user[1] && token[1]) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token[1]}`;

        setUser(JSON.parse(user[1]));
      }

      setisSigningIn(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isSigningIn }}>
      {children}
    </AuthContext.Provider>
  );
}