import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { storageService } from "../services/storageService";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    storageService.seed();
    const allUsers = storageService.get("gsi_users");
    setUsers(allUsers);
    
    // Forçar sempre como Administrador
    const adminUser = allUsers.find((u: User) => u.role === "Administrador");
    if (adminUser) {
      setCurrentUser(adminUser);
    } else if (allUsers.length > 0) {
      setCurrentUser(allUsers[0]);
    }
  }, []);

  const switchUser = (userId: string) => {
    // Disable switching
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
