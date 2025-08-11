import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">Case Study Builder</h1>
      <div className="flex items-center gap-4">
        <ThemeSelector />
        <Button variant="outline" onClick={handleLogout} className="rounded-lg">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;