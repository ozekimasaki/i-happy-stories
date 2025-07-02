import React, { useState } from 'react';
import Modal from '../../common/Modal';

// Based on Google's documentation for TTS voices
const availableVoices = [
  { value: 'zephyr', label: 'Zephyr' },
  { value: 'puck', label: 'Puck' },
  { value: 'gacrux', label: 'Gacrux' },
  { value: 'alnilam', label: 'Alnilam' },
  { value: 'rasalgethi', label: 'Rasalgethi' },
  { value: 'vindemiatrix', label: 'Vindemiatrix' },
  { value: 'zubenelgenubi', label: 'Zubenelgenubi' },
  { value: 'achernar', label: 'Achernar' },
  { value: 'achird', label: 'Achird' },
  { value: 'algenib', label: 'Algenib' },
  { value: 'algieba', label: 'Algieba' },
  { value: 'aoede', label: 'Aoede' },
  { value: 'autonoe', label: 'Autonoe' },
  { value: 'callirrhoe', label: 'Callirrhoe' },
  { value: 'charon', label: 'Charon' },
  { value: 'despina', label: 'Despina' },
  { value: 'enceladus', label: 'Enceladus' },
  { value: 'erinome', label: 'Erinome' },
  { value: 'fenrir', label: 'Fenrir' },
  { value: 'iapetus', label: 'Iapetus' },
  { value: 'kore', label: 'Kore' },
  { value: 'laomedeia', label: 'Laomedeia' },
  { value: 'leda', label: 'Leda' },
  { value: 'orus', label: 'Orus' },
  { value: 'pulcherrima', label: 'Pulcherrima' },
  { value: 'sadachbia', label: 'Sadachbia' },
  { value: 'sadaltager', label: 'Sadaltager' },
  { value: 'schedar', label: 'Schedar' },
  { value: 'sulafat', label: 'Sulafat' },
  { value: 'umbriel', label: 'Umbriel' },
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
