import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const StoryGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    console.log('Submitted prompt:', prompt);
    // 今後のサブタスクでAPI送信ロジックをここに追加します
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">物語の作成</h1>
      <div className="grid w-full gap-2">
        <Label htmlFor="prompt">プロンプト</Label>
        <Textarea
          id="prompt"
          placeholder="ここに物語のアイデアを入力してください..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={!prompt.trim()}>物語を生成する</Button>
      </div>
    </div>
  );
};

export default StoryGenerationPage; 