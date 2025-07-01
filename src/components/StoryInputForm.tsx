import React, { useState } from 'react';

interface StoryInputFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const StoryInputForm: React.FC<StoryInputFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-stone-700">
          どんな物語を紡ぎますか？
        </label>
        <textarea
          id="prompt"
          placeholder="例：「ニンジンが大好きな、空飛ぶウサギの冒険」 「今日、公園で子どもが初めて歩いた。その時の感動を物語にしたい。」"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm h-32"
          rows={4}
        />
        <p className="mt-2 text-xs text-stone-500">
          あなたの体験や感情、または想像した場面を自由に入力してください。AIがあなただけの物語を紡ぎます。
        </p>
      </div>
      <button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? '生成中...' : '物語を生成する'}
      </button>
    </form>
  );
};

export default StoryInputForm;
