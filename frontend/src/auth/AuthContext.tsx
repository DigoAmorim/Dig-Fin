import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, login as loginRequest, logout as logoutRequest, refreshSession, register as registerRequest } from './auth-api';
import type { AuthAccount, AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  account: AuthAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // A sessao fica no cookie HttpOnly, portanto a unica forma segura de
    // restaurar o estado do React e perguntar ao backend quem esta logado.
    // O estado de autenticacao nao e persistido no React. Ao recarregar a
    // pagina, consultamos o backend; os cookies sao enviados automaticamente.
    getSession()
      .then((session) => {
        if (!active) return;
        setUser(session.user);
        setAccount(session.account);
      })
      .catch(async () => {
        // Se o access token expirou, tentamos uma rotacao usando o refresh
        // token antes de considerar a sessao encerrada.
        try {
          const session = await refreshSession();
          if (!active) return;
          setUser(session.user);
          setAccount(session.account);
        } catch {
          if (active) {
            setUser(null);
            setAccount(null);
          }
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // O backend define a sessao nos cookies; o frontend guarda apenas dados
    // publicos para renderizar a interface.
    const session = await loginRequest(email, password);
    setUser(session.user);
    setAccount(session.account);
  };

  const register = async (email: string, password: string): Promise<void> => {
    const session = await registerRequest(email, password);
    setUser(session.user);
    setAccount(session.account);
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ user, account, isLoading, isAuthenticated: user !== null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}