import React, { useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { toast } from "sonner";

const StoryGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState<{ story: string; imageUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuthStore();

  const handleSubmit = async () => {
    if (!session) {
      toast.error('ログインしていません。');
      return;
    }

    setIsLoading(true);
    setStory(null);

    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || '物語の生成に失敗しました。');
      }

      const data = await response.json() as { story: { content: string }, illustration?: { image_url: string } };
      setStory({
        story: data.story.content,
        imageUrl: data.illustration?.image_url || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg border border-stone-200 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-stone-800">物語の作成</h1>
          <p className="text-stone-500">あなたのアイデアから、AIが世界に一つだけの物語を紡ぎ出します。</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-stone-700">作りたい物語のテーマ</label>
            <textarea
              id="prompt"
              placeholder="例：「魔法の森に住む、歌うのが好きな小さなキツネの冒険」 「今日は娘の誕生日、娘は大好物のショートケーキを美味しそうに食べていた。」"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm h-32"
            />
          </div>
          <button onClick={handleSubmit} disabled={!prompt.trim() || isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? '生成中...' : '物語を生成する'}
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 text-center text-stone-600">
            <p>物語を生成しています。しばらくお待ちください...</p>
          </div>
        )}

        {story && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-stone-800">生成された物語</h2>
            </div>
            <div className="space-y-4">
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt="生成されたイラスト"
                  className="rounded-lg w-full max-w-md mx-auto shadow-md"
                />
              )}
              <div className="prose prose-stone max-w-none lg:prose-lg">
                {story.story.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerationPage;