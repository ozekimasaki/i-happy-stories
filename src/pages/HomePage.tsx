import React from 'react';
import useAuthStore from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

const HomePage: React.FC = () => {
  const { user, login, logout } = useAuthStore();

  const handleLogin = () => {
    // ダミーのユーザー情報とトークンでログイン
    const dummyUser: User = {
      id: '12345678-1234-1234-1234-1234567890ab',
      app_metadata: { provider: 'email' },
      user_metadata: { name: 'Test User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    const dummyToken = 'dummy-auth-token';
    login(dummyUser, dummyToken);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      {user && user.user_metadata ? (
        <div>
          <p>Welcome, {user.user_metadata.name}!</p>
          <Button onClick={logout} variant="destructive" className="mt-2">Logout</Button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <Button onClick={handleLogin} className="mt-2">Login</Button>
        </div>
      )}
    </div>
  );
};

export default HomePage; 