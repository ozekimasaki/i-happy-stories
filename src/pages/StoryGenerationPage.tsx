import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import StoryInputForm from '@/components/StoryInputForm';
import type { Story } from 'types/hono';

const StoryGenerationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  const handleGenerateStory = async (prompt: string, age: string, length: string) => {
    if (!session) {
      toast.error('物語を生成するにはログインが必要です。');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, age, length }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || '物語の生成に失敗しました。');
      }

      const data = await response.json() as { story: Story };
      toast.success('新しい物語が生まれました！');
      navigate(`/stories/${data.story.id}`);

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
        
        <StoryInputForm onSubmit={handleGenerateStory} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-4 text-center text-stone-600">
            <div className="animate-pulse">
              <p className="text-lg">物語を紡いでいます...</p>
              <p className="text-sm">素晴らしい物語がもうすぐ生まれます。しばらくお待ちください。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerationPage;