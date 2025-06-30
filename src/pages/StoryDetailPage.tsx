import { useEffect, useState } from 'react';
import type React from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const { session } = useAuthStore();

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
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200">
        <Link to="/stories" className="text-stone-600 hover:text-stone-800 hover:underline mb-4 inline-block">&larr; 物語一覧へ戻る</Link>
        <h1 className="text-3xl font-bold mb-2 text-stone-800">{story.title}</h1>
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
  );
};

export default StoryDetailPage;