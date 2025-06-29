import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="container mx-auto text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to Monogatari Weavers</h1>
      <p className="text-xl text-muted-foreground mb-8">Weave your own stories with the power of AI.</p>
      <div>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">Welcome back, {user?.email}!</p>
            <Button asChild>
              <Link to="/stories">Go to Your Stories</Link>
            </Button>
          </div>
        ) : (
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 