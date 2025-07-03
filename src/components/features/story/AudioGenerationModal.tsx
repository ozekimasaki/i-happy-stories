import React, { useState } from 'react';
import Modal from '../../common/Modal';

// Based on Google's documentation for TTS voices
const availableVoices = [
  { value: 'zephyr', label: 'Zephyr (明るい)' },
  { value: 'puck', label: 'Puck (明るく元気)' },
  { value: 'gacrux', label: 'Gacrux (成熟した)' },
  { value: 'alnilam', label: 'Alnilam (しっかりした)' },
  { value: 'rasalgethi', label: 'Rasalgethi (分かりやすい)' },
  { value: 'vindemiatrix', label: 'Vindemiatrix (優しい)' },
  { value: 'zubenelgenubi', label: 'Zubenelgenubi (カジュアル)' },
  { value: 'achernar', label: 'Achernar (柔らかい)' },
  { value: 'achird', label: 'Achird (フレンドリー)' },
  { value: 'algenib', label: 'Algenib (しわがれた)' },
  { value: 'algieba', label: 'Algieba (スムーズ)' },
  { value: 'aoede', label: 'Aoede (軽快)' },
  { value: 'autonoe', label: 'Autonoe (明るい)' },
  { value: 'callirrhoe', label: 'Callirrhoe (のんびり)' },
  { value: 'charon', label: 'Charon (分かりやすい)' },
  { value: 'despina', label: 'Despina (スムーズ)' },
  { value: 'enceladus', label: 'Enceladus (息づかいの多い)' },
  { value: 'erinome', label: 'Erinome (クリア)' },
  { value: 'fenrir', label: 'Fenrir (興奮した)' },
  { value: 'iapetus', label: 'Iapetus (クリア)' },
  { value: 'kore', label: 'Kore (しっかりした)' },
  { value: 'laomedeia', label: 'Laomedeia (明るく元気)' },
  { value: 'leda', label: 'Leda (若々しい)' },
  { value: 'orus', label: 'Orus (しっかりした)' },
  { value: 'pulcherrima', label: 'Pulcherrima (前向き)' },
  { value: 'sadachbia', label: 'Sadachbia (生き生きした)' },
  { value: 'sadaltager', label: 'Sadaltager (博識な)' },
  { value: 'schedar', label: 'Schedar (均一な)' },
  { value: 'sulafat', label: 'Sulafat (温かい)' },
  { value: 'umbriel', label: 'Umbriel (のんびり)' },
];

interface AudioGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (voice: string) => Promise<void>;
  isGenerating: boolean;
}

const AudioGenerationModal: React.FC<AudioGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].value);

  const handleGenerateClick = () => {
    onGenerate(selectedVoice);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="音声読み上げを生成">
      <div className="space-y-4">
        <div>
          <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-1">
            話者を選択してください
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={isGenerating}
          >
            {availableVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            disabled={isGenerating}
          >
            キャンセル
          </button>
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '生成する'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AudioGenerationModal;
