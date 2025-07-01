import { useEffect, useState } from 'react';
import type React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { Story } from 'types/hono';
import { getStory, publishStory, unpublishStory } from '@/lib/apiClient';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const { session } = useAuthStore();
  const navigate = useNavigate();

    const handleTogglePublish = async () => {
    if (!story) return;

    try {
      let updatedStoryFields;
      if (story.is_public) {
        updatedStoryFields = await unpublishStory(story.id);
        toast.success('物語を非公開にしました。');
      } else {
        updatedStoryFields = await publishStory(story.id);
        setPublicUrl(`${window.location.origin}/stories/${story.id}`);
        setIsPublishModalOpen(true);
      }
      // Merge the updated fields with the existing story state to preserve illustrations
      setStory(prevStory => ({ ...prevStory!, ...updatedStoryFields }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '公開状態の更新に失敗しました。';
      toast.error(errorMessage);
      console.error('Failed to update publish status:', error);
    }
  };

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
      if (!id) {
        toast.error('物語のIDが見つかりません。');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const storyData = await getStory(parseInt(id, 10));
        setStory(storyData);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました。';
        toast.error(errorMessage);
        setStory(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryDetail();
  }, [id]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-stone-600">物語を読み込んでいます...</div>;
  }

  if (!story) {
    return <div className="container mx-auto p-4 text-stone-600">物語が見つかりませんでした。</div>;
  }

  const isOwner = session && story && session.user.id === story.user_id;

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        {isOwner && (
          <div className="max-w-4xl mx-auto mb-6">
            <Link to="/stories" className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors duration-200 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              物語一覧に戻る
            </Link>
          </div>
        )}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 font-serif">{story.title}</h1>
            {isOwner && (
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link
                  to={`/stories/edit/${story.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  編集
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  削除
                </button>
                <button
                  onClick={handleTogglePublish}
                  className={`${
                    story.is_public
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
                >
                  {story.is_public ? '非公開にする' : '公開する'}
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

      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full m-4 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold mb-4 text-stone-800">物語を公開しました！</h2>
            <p className="text-stone-700 mb-6">
              この物語は誰でも閲覧できるようになりました。下のURLを共有しましょう。
            </p>
            <div className="flex items-center space-x-2 mb-8">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success('URLをコピーしました！');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                コピー
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

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