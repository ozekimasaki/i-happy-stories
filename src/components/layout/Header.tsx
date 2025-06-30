import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const Header: React.FC = () => {
  const { session, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          ものがたりWeavers
        </Link>
        <nav>
          {session ? (
            <div className="flex items-center gap-4">
              <Link to="/stories" className="text-gray-600 hover:text-gray-800">
                マイストーリー
              </Link>
              <Link to="/generate-story">
                <button className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded">物語を作成</button>
              </Link>
              <button className="bg-transparent text-gray-600 hover:text-gray-800 py-2 px-4 rounded" onClick={handleLogout}>
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <button className="border border-gray-600 text-gray-600 hover:bg-gray-100 py-2 px-4 rounded">ログイン</button>
              </Link>
              <Link to="/signup">
                <button className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded">新規登録</button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 