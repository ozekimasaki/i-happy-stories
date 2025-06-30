import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';


const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="container mx-auto text-center py-20">
      <h1 className="text-4xl font-bold mb-4 text-stone-800">モノガタリウィーバーズへようこそ</h1>
      <p className="text-xl text-stone-500 mb-8">AIの力であなただけの物語を紡ぎましょう。</p>
      <div>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-stone-700">おかえりなさい, {user?.email}さん!</p>
            <Link to="/stories" className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded inline-block">あなたの物語へ</Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded inline-block">ログイン</Link>
            <Link to="/signup" className="border border-stone-600 text-stone-600 hover:bg-stone-100 py-2 px-4 rounded inline-block">新規登録</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 