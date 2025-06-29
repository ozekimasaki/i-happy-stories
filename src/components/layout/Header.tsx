import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Monogatari Weavers
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/"><Button variant="ghost">Home</Button></Link>
          {user ? (
            <>
              <Link to="/stories"><Button variant="ghost">My Stories</Button></Link>
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/signup"><Button>Sign Up</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 