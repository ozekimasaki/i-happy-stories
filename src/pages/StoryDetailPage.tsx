import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

        const data = await response.json();
        setStory(data.story);
      } catch (error: any) {
        toast.error(error.message || '予期せぬエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryDetail();
  }, [id, session]);

  if (isLoading) {
    return <div className="container mx-auto p-4">物語を読み込んでいます...</div>;
  }

  if (!story) {
    return <div className="container mx-auto p-4">物語が見つかりませんでした。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        作成日時: {new Date(story.created_at).toLocaleString()}
      </p>
      
      {story.illustrations && story.illustrations.length > 0 && (
        <img 
          src={story.illustrations[0].image_url} 
          alt={story.title}
          className="rounded-lg object-cover w-full max-w-2xl mx-auto mb-6" 
        />
      )}
      
      <div className="prose max-w-none">
        <p>{story.content}</p>
      </div>
    </div>
  );
};

export default StoryDetailPage; 