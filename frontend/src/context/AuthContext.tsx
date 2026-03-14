'use client';


import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { clearExpiredToken, validateToken } from "@/utils/jwtUtils";

interface AuthContextType {
  userName: string | null;
  userId: string | null;
  userPhone: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  login: (token: string) => void;
  updateUser: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userName, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userPhone, setUserPhone] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const auth = () => {
            try {
                clearExpiredToken();
                const storedUser = localStorage.getItem('token');
                if (storedUser) {
                    const tokenValidation = validateToken(storedUser);
                    if (tokenValidation.isValid && tokenValidation.decoded) {
                        setIsAuthenticated(true);
                        setUser(tokenValidation.decoded.name);
                        setUserId(tokenValidation.decoded.id);
                        setUserPhone(tokenValidation.decoded.phone);
                        console.log('Valid token found, user authenticated');
                    } else {
                        setIsAuthenticated(false);
                        setUser(null);
                        setUserId(null);
                        setUserPhone(null);
                        console.log('No valid tokens found, user not authenticated');
                    }
                }
            } catch (error) {
                console.error('Error occurred while validating token:', error);
                setIsAuthenticated(false);
                setUser(null);
                setUserId(null);
                setUserPhone(null);
                localStorage.removeItem('token');
            }
        };
        auth();
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem("token")
            setUser(null);
            setUserId(null);
            setUserPhone(null);
            setIsAuthenticated(false);

            router.push('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            router.push('/');
        }
    }, [router]);

    const login = (token: string) => {
        const tokenValidation = validateToken(token);

        if (!tokenValidation.isValid || !tokenValidation.decoded) {
            console.error("Invalid token");
            return;
        }
        console.log('Storing token in localStorage and updating auth state');
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        setUserId(tokenValidation.decoded.id);
        setUser(tokenValidation.decoded.name);
        setUserPhone(tokenValidation.decoded.phone);
    };

    const updateUser = (name: string) => {
        setUser(name);
    };

    return (
        <AuthContext.Provider value={{updateUser, userName, userId, userPhone, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;    