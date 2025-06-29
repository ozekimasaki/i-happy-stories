import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    const fetchStories = async () => {
      if (!session) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/posts', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.status === 401) {
          toast.error('認証の有効期限が切れました。再度ログインしてください。');
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('物語の取得に失敗しました。');
        }

        const data = await response.json();
        console.log('Fetched stories:', data.stories);
        setStories(data.stories || []);
      } catch (error: any) {
        toast.error(error.message || '予期せぬエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [session]);

  if (!session && isLoading) {
    return <div className="container mx-auto p-4">セッション情報を確認中...</div>;
  }
  
  if (isLoading) {
    return <div className="container mx-auto p-4">物語を読み込んでいます...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">あなたの物語一覧</h1>
      
      {stories.length === 0 ? (
        <p>まだ物語がありません。新しい物語を作成しましょう！</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Link to={`/stories/${story.id}`} key={story.id}>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  {story.illustrations && story.illustrations.length > 0 && (
                    <img 
                      src={story.illustrations[0].image_url} 
                      alt={story.title}
                      className="rounded-md object-cover h-48 w-full mb-4" 
                    />
                  )}
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {story.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-gray-400">
                    作成日時: {new Date(story.created_at).toLocaleString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesPage; 