import { useEffect, useState } from 'react';
import type React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface Story {
  id: number;
  title: string;
  content: string;
}

const StoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      if (!session || !id) {
        toast.error('不正なアクセスです。');
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`/api/v1/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('物語の読み込みに失敗しました。');
        }

        const data = await response.json() as { story: Story };
        setTitle(data.story.title);
        setContent(data.story.content);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('予期せぬエラーが発生しました。');
        }
        navigate(`/stories/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [id, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !id) {
      toast.error('更新を実行できません。');
      return;
    }

    try {
      const response = await fetch(`/api/v1/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorData?.error || '物語の更新に失敗しました。');
      }

      toast.success('物語を更新しました。');
      navigate(`/stories/${id}`);

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('予期せぬエラーが発生しました。');
      }
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200">
        <h1 className="text-3xl font-bold text-stone-800 mb-6">物語を編集する</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-stone-700 text-sm font-bold mb-2">タイトル</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-stone-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="content" className="block text-stone-700 text-sm font-bold mb-2">本文</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-stone-700 leading-tight focus:outline-none focus:shadow-outline h-64"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/stories/${id}`)}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              更新する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryEditPage;
