import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookText } from 'lucide-react';

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
    <header className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-2">
        <BookText className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Case Study Builder</h1>
      </div>
      <Button variant="ghost" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
};

export default Header;