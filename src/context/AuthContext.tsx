import React, { createContext, useState, useContext } from 'react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  specialty: string;
  avatarConfig: {
    bgColor: string;
    initial: string;
  };
  isAdmin: boolean;
  xp: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (name: string, email: string, password: string, specialty: string, avatarConfig: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Remove this default user in production
  const defaultUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    specialty: 'General Medicine',
    avatarConfig: {
      bgColor: 'from-primary-500 to-secondary-500',
      initial: 'T'
    },
    isAdmin: true,
    xp: 1000,
    level: 5
  };

  const [user, setUser] = useState<User | null>(defaultUser);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData && !error) {
          setUser(userData);
          setIsAdmin(userData.isAdmin || false);
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !error) {
            setUser(userData);
            setIsAdmin(userData.isAdmin || false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (
    name: string,
    email: string, 
    password: string, 
    specialty: string, 
    avatarConfig: any
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user && !error) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          { 
            id: data.user.id,
            name,
            email,
            specialty,
            avatarConfig,
            isAdmin: false,
            xp: 0,
            level: 1
          }
        ]);
      
      if (profileError) {
        return { error: profileError };
      }
    }

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};