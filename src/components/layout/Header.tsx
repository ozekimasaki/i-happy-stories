import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
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
                <Button>物語を作成</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                ログアウト
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link to="/signup">
                <Button>新規登録</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 