import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const Header: React.FC = () => {
  const { session, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-stone-50 border-b border-stone-200">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-stone-800">
          I Happy Stories
        </Link>

        {/* Hamburger Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="メニューを開閉する">
            <svg
              className="w-6 h-6 text-stone-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <Link to="/stories" className="text-stone-600 hover:text-stone-800">
                物語一覧
              </Link>
              <Link to="/generate-story">
                <button className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded">物語を作る</button>
              </Link>
              <button
                className="bg-transparent text-stone-600 hover:text-stone-800 py-2 px-4 rounded"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="border border-stone-600 text-stone-600 hover:bg-stone-100 py-2 px-4 rounded">
                  ログイン
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded">新規登録</button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-stone-50 border-t border-stone-200">
          {session ? (
            <div className="flex flex-col items-stretch gap-2 p-4">
              <Link
                to="/stories"
                className="text-stone-600 hover:text-stone-800 text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                物語一覧
              </Link>
              <Link to="/generate-story" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded w-full">
                  物語を作る
                </button>
              </Link>
              <button
                className="bg-transparent text-stone-600 hover:text-stone-800 py-2 px-4 rounded"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-stretch gap-2 p-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="border border-stone-600 text-stone-600 hover:bg-stone-100 py-2 px-4 rounded w-full">
                  ログイン
                </button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded w-full">
                  新規登録
                </button>
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;