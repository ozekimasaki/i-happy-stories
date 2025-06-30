import { useEffect, useState } from 'react';
import type React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface Story {
  id: number;
  title: string;
  content: string;
  created_at: string;
  illustrations: {
    id: number;
    image_url: string;
    prompt: string;
  }[];
}

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!session || !id) {
      toast.error('削除を実行できません。');
      return;
    }

    try {
      const response = await fetch(`/api/v1/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = '物語の削除に失敗しました。';
        try {
          const errorData = await response.json() as { error?: string };
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // JSONのパースに失敗した場合は、デフォルトのエラーメッセージを使用します
        }
        throw new Error(errorMessage);
      }

      toast.success('物語を削除しました。');
      navigate('/stories');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('予期せぬエラーが発生しました。');
      }
    }
  };

  useEffect(() => {
    const fetchStoryDetail = async () => {
      if (!session) {
        return;
      }
      if (!id) {
        toast.error('物語のIDが見つかりません。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.status === 404) {
          toast.error('指定された物語が見つかりません。');
          setStory(null);
          return;
        }

        if (!response.ok) {
          throw new Error('物語の取得に失敗しました。');
        }

        const data = await response.json() as { story: Story };
        setStory(data.story);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('予期せぬエラーが発生しました。');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryDetail();
  }, [id, session]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-stone-600">物語を読み込んでいます...</div>;
  }

  if (!story) {
    return <div className="container mx-auto p-4 text-stone-600">物語が見つかりませんでした。</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200">
          <Link to="/stories" className="text-stone-600 hover:text-stone-800 hover:underline mb-4 inline-block">&larr; 物語一覧へ戻る</Link>
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-stone-800">{story.title}</h1>
            {session && (
              <div className="flex items-center gap-4">
                <Link
                  to={`/stories/${id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  編集する
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                  物語を削除
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-stone-500 mb-6">
            作成日時: {new Date(story.created_at).toLocaleString()}
          </p>
          
          {story.illustrations && story.illustrations.length > 0 && (
            <img 
              src={story.illustrations[0].image_url} 
              alt={story.title}
              className="rounded-lg object-cover w-full max-w-3xl mx-auto mb-8 shadow-md" 
            />
          )}
          
          <div className="prose prose-stone max-w-none lg:prose-lg">
            {story.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full m-4 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold mb-4 text-stone-800">物語の削除の確認</h2>
            <p className="text-stone-700 mb-8">これは大事な物語です。本当に削除していいですか？<br />この操作は取り消せません。</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await handleDelete();
                  setIsDeleteModalOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryDetailPage;