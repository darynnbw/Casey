import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

const Login = () => {
  const { session } = useAuth();
  const { resolvedTheme } = useTheme();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border/50">
        <h2 className="text-3xl font-bold text-center text-foreground">Case Study Builder</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
};

export default Login;