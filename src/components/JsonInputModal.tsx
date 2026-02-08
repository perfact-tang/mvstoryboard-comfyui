import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import { ProjectData } from '../types';

export const JsonInputModal: React.FC = () => {
  const { isModalOpen, setModalOpen, setData } = useStore();
  const [input, setInput] = useState('');

  if (!isModalOpen) return null;

  const handleProcess = () => {
    try {
      const parsed: ProjectData = JSON.parse(input);
      // Basic validation
      if (!parsed.proposals || !parsed.character_designs) {
        throw new Error('Invalid data structure');
      }
      setData(parsed);
      setModalOpen(false);
      setInput('');
    } catch (e) {
      alert("JSON 格式错误，请检查输入！");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">导入方案 JSON</h3>
          <button 
            onClick={() => setModalOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON 数据..."
            className="w-full h-80 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProcess}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              开始可视化
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
