import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

const StoryGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState<{ story: string; imageUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  const handleSubmit = async () => {
    if (!session) {
      setError('ログインしていません。');
      return;
    }

    setIsLoading(true);
    setError(null);
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
        const errorData = await response.json();
        throw new Error(errorData.error || '物語の生成に失敗しました。');
      }

      const data = await response.json();
      setStory({
        story: data.story.content,
        imageUrl: data.illustration?.image_url || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">物語の作成</h1>
      <div className="grid w-full gap-4">
        <div>
          <Label htmlFor="prompt">プロンプト</Label>
          <Textarea
            id="prompt"
            placeholder="ここに物語のアイデアを入力してください..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleSubmit} disabled={!prompt.trim() || isLoading}>
          {isLoading ? '生成中...' : '物語を生成する'}
        </Button>
      </div>

      {error && (
        <Card className="mt-4 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="mt-4 text-center">
          <p>物語を生成しています。しばらくお待ちください...</p>
        </div>
      )}

      {story && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>生成された物語</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {story.imageUrl && (
              <img
                src={story.imageUrl}
                alt="生成されたイラスト"
                className="rounded-lg w-full max-w-md mx-auto"
              />
            )}
            <p className="whitespace-pre-wrap">{story.story}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoryGenerationPage; 