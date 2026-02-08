import React, { useState, DragEvent } from 'react';
import { FileJson, UploadCloud } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProjectData } from '../types';

export const EmptyState: React.FC = () => {
  const { setData } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            // Simple validation check
            if (json.proposals && json.character_designs) {
              setData(json as ProjectData);
            } else {
              alert('JSON 格式不正确：缺少 proposals 或 character_designs 字段');
            }
          } catch (error) {
            alert('JSON 解析错误：请检查文件内容');
          }
        };
        reader.readAsText(file);
      } else {
        alert('请拖入 JSON 文件');
      }
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center py-20 glass-card rounded-2xl backdrop-blur border transition-all duration-300 ${
        isDragging 
          ? 'bg-blue-50/90 border-blue-400 border-dashed scale-[1.02] shadow-xl' 
          : 'bg-white/80 border-slate-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging ? (
        <>
          <UploadCloud className="w-20 h-20 text-blue-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-blue-600">释放以导入文件</h2>
          <p className="text-blue-400">正在读取 JSON...</p>
        </>
      ) : (
        <>
          <FileJson className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-medium text-slate-600">暂无数据</h2>
          <p className="text-slate-400">请导入或拖拽 AI 生成的方案 JSON 数据至此</p>
        </>
      )}
    </div>
  );
};
