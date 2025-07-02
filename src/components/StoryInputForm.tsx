import React, { useState } from 'react';

interface StoryInputFormProps {
  onSubmit: (prompt: string, age: string, length: string) => void;
  isLoading: boolean;
  defaultValues?: {
    prompt?: string;
    age?: string;
    length?: string;
  }
}

const ageOptions = [
  { value: '1-2歳', label: '1-2歳' },
  { value: '3-4歳', label: '3-4歳' },
  { value: '5-6歳', label: '5-6歳' },
  { value: '7-8歳', label: '7-8歳' },
  { value: '9-10歳', label: '9-10歳' },
  { value: '11-12歳', label: '11-12歳' },
];

const lengthOptions = [
  { value: 'very_short', label: 'ごく短い (100〜200字)' },
  { value: 'short', label: '短め (200〜400字)' },
  { value: 'medium', label: 'ふつう (400〜700字)' },
  { value: 'long', label: '長め (700〜1000字)' },
  { value: 'very_long', label: 'かなり長い (1000〜1500字)' },
];

const StoryInputForm: React.FC<StoryInputFormProps> = ({ onSubmit, isLoading, defaultValues }) => {
  const [prompt, setPrompt] = useState(defaultValues?.prompt || '');
  const [age, setAge] = useState(defaultValues?.age || ageOptions[0].value);
  const [length, setLength] = useState(defaultValues?.length || lengthOptions[2].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, age, length);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="prompt" className="block font-medium">物語のテーマ</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例：今日、子どもが公園で転んで泣いてしまった。励ますような物語がほしい。"
          className="min-h-[120px] resize-y w-full border rounded p-2"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="age" className="block font-medium">対象年齢</label>
          <select
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={isLoading}
            className="w-full border rounded p-2"
          >
            {ageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="length" className="block font-medium">物語の長さ</label>
          <select
            id="length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            disabled={isLoading}
            className="w-full border rounded p-2"
          >
            {lengthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full py-2 px-4 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50"
      >
        {isLoading ? '生成中...' : '物語を生成する'}
      </button>
    </form>
  );
};

export default StoryInputForm;
