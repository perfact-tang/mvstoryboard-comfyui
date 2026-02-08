import React, { useState } from 'react';
import { Upload, PlayCircle, Settings, Loader2, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sampleData } from '../utils/sampleData';

export const Header: React.FC = () => {
  const { setModalOpen, setData, comfyUiUrl, isGeneratingAll, setIsGeneratingAll, data, workflowVersion, setWorkflowVersion } = useStore();
  
  // Use environment variable for display, fallback to store value
  const displayUrl = import.meta.env.VITE_COMFY_API_URL || comfyUiUrl;

  const handleSaveJson = () => {
    if (!data) {
      alert("当前没有可保存的数据。请先导入或生成内容。");
      return;
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `storyboard_data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("保存 JSON 失败:", error);
      alert("保存文件时发生错误");
    }
  };

  const handleGenerateAll = () => {
    // This will trigger the generation in Dashboard component
    // Since Header is outside Dashboard, we need a way to communicate.
    // The easiest way is to use the store to trigger it, but the generation logic is inside Dashboard.
    // Alternatively, we can move the generation logic to the store or a utility hook.
    // For now, let's use the setIsGeneratingAll flag in the store to signal Dashboard.
    setIsGeneratingAll(true);
  };

  return (
    <div className="mb-8 space-y-4">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MV 拍摄方案可视化</h1>
          <p className="text-slate-500 mt-1">基于 AI 生成的创意方案交互看板</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Upload size={20} />
            导入 JSON
          </button>
          <button 
            onClick={() => setData(sampleData)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            <PlayCircle size={20} />
            查看示例
          </button>
        </div>
      </header>
      
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
             <span className="text-xs font-bold text-slate-500">ComfyUI:</span>
             <div className="text-xs text-slate-700 w-48 truncate" title={displayUrl}>
               {displayUrl}
             </div>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-slate-500">Workflow:</span>
              <select
                value={workflowVersion}
                onChange={(e) => setWorkflowVersion(e.target.value)}
                className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer"
              >
                <option value="Qwen-Image-2512">Qwen-Image-2512</option>
                <option value="Z-Image-Turbo">Z-Image-Turbo</option>
              </select>
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={handleGenerateAll}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition shadow-sm"
            >
                <PlayCircle size={20} />
                AI生成所有内容
            </button>
            <button 
                onClick={handleSaveJson}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition shadow-sm"
            >
                <Download size={20} />
                保存内容至Json文件
            </button>
        </div>
      </div>
    </div>
  );
};
