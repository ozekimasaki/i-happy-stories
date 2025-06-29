import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="container mx-auto text-center py-20">
      <h1 className="text-4xl font-bold mb-4">モノガタリウィーバーズへようこそ</h1>
      <p className="text-xl text-muted-foreground mb-8">AIの力であなただけの物語を紡ぎましょう。</p>
      <div>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">おかえりなさい, {user?.email}さん!</p>
            <Button asChild>
              <Link to="/stories">あなたの物語へ</Link>
            </Button>
          </div>
        ) : (
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">ログイン</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/signup">新規登録</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 