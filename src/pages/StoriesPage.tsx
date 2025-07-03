import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

import { Link } from 'react-router-dom';
import type { Story } from 'types/hono';
import { PlayCircle, Loader2, AlertTriangle } from 'lucide-react';

const AudioStatusIcon: React.FC<{ status: Story['audio_status'] }> = ({ status }) => {
  switch (status) {
    case 'in_progress':
      return (
        <div title="音声生成中">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      );
    case 'completed':
      return (
        <div title="音声あり">
          <PlayCircle className="h-5 w-5 text-green-500" />
        </div>
      );
    case 'failed':
      return (
        <div title="音声の生成に失敗しました">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      );
    case 'not_started':
    default:
      return null;
  }
};

import { useStoryStore } from '@/stores/storyStore';

const StoriesPage: React.FC = () => {
  const { session } = useAuthStore();
  const { stories, isLoading, fetchStories } = useStoryStore();

  console.log('[StoriesPage] Rendering. isLoading:', isLoading, 'Stories count:', stories.length);
  if (stories.length > 0) {
    console.log('[StoriesPage] Stories statuses:', stories.map(s => ({ id: s.id, status: s.audio_status })));
  }
  useEffect(() => {
    if (session) {
      console.log('[StoriesPage] useEffect fetching stories...');
      fetchStories(session.access_token);
    }
  }, [session, fetchStories]);

  if (isLoading) {
    return <div className="container mx-auto p-4">物語を読み込んでいます...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-stone-800">あなたの物語一覧</h1>
      
      {stories.length === 0 ? (
        <p className="text-stone-600">まだ物語がありません。新しい物語を作成しましょう！</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Link to={`/stories/${story.id}`} key={story.id} className="block hover:no-underline group">
              <div className="h-full flex flex-col bg-white border border-stone-200 rounded-lg group-hover:border-amber-400 transition-colors duration-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h2 className="text-lg font-bold truncate text-stone-800">{story.title}</h2>
                      <AudioStatusIcon status={story.audio_status} />
                    </div>
                    {story.is_public && (
                      <span 
                        className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full whitespace-nowrap"
                      >
                        公開中
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-4 flex-grow">
                  {story.illustrations && story.illustrations.length > 0 && (
                    <img 
                      src={story.illustrations[0].image_url} 
                      alt={story.title}
                      className="rounded-md object-cover h-48 w-full mb-4" 
                    />
                  )}
                  <p className="text-sm text-stone-600 line-clamp-3">
                    {story.content}
                  </p>
                </div>
                <div className="p-4 pt-2 mt-auto border-t border-t-stone-200">
                  <p className="text-xs text-stone-500">
                    作成日時: {new Date(story.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesPage; 