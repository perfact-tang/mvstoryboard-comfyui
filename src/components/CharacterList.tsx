import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Image as ImageIcon, Sparkles, Loader2, Maximize2, X } from 'lucide-react';
import { EditableText } from './EditableText';
import { generateComfyImage } from '../utils/comfyApi';

export const CharacterList: React.FC = () => {
  const { data, updateData, comfyUiUrl, workflowVersion } = useStore();
  const [generatingStates, setGeneratingStates] = useState<Record<string, boolean>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGlobalGenerating, setIsGlobalGenerating] = useState(false);

  if (!data) return null;

  const updateCharacterPrompt = (charIndex: number, styleIndex: number, value: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    newData.character_designs[charIndex].styling_variations[styleIndex].image_prompt = value;
    updateData(newData);
  };

  const updateCharacterImage = (charIndex: number, styleIndex: number, imageUrl: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    // Assuming we want to store the generated image URL somewhere in the style object
    // Since the type definition doesn't have an image field yet, we might need to add it or use a temporary way.
    // Based on previous patterns, let's assume we can add an 'image_url' field to CharacterStyle interface in types/index.ts
    // For now, I will add it dynamically, but ideally types should be updated.
    if (!newData.character_designs[charIndex].styling_variations[styleIndex].generated_image) {
         newData.character_designs[charIndex].styling_variations[styleIndex].generated_image = "";
    }
    newData.character_designs[charIndex].styling_variations[styleIndex].generated_image = imageUrl;
    updateData(newData);
  };

  const handleGenerateAI = async (charIndex: number, styleIndex: number, prompt: string, styleDescription: string) => {
    const key = `${charIndex}-${styleIndex}`;
    if (generatingStates[key]) return;

    setGeneratingStates(prev => ({ ...prev, [key]: true }));
    setIsGlobalGenerating(true);

    try {
      const combinedPrompt = `${prompt}, ${styleDescription}`;
      const imageUrl = await generateComfyImage(combinedPrompt, comfyUiUrl, workflowVersion);
      updateCharacterImage(charIndex, styleIndex, imageUrl);
    } catch (error) {
      console.error("Character AI Generation failed:", error);
      alert(`生成失败: ${error}`);
    } finally {
      setGeneratingStates(prev => ({ ...prev, [key]: false }));
      setIsGlobalGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      {data.character_designs.map((char, charIdx) => (
        <div key={char.character_id} className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center">
              <User />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{char.role_name}</h2>
              <p className="text-slate-500 text-sm">{char.character_description}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {char.styling_variations.map((style: any, styleIdx) => { // Using any temporarily to access generated_image
               const isGenerating = generatingStates[`${charIdx}-${styleIdx}`];
               
               return (
              <div key={styleIdx} className="glass-card p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition group bg-white/80 backdrop-blur flex flex-col h-full">
                <div className="bg-slate-100 aspect-[3/4] rounded-lg mb-3 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 group-hover:bg-blue-50 transition overflow-hidden relative">
                  {style.generated_image ? (
                     <div className="relative w-full h-full group/image cursor-pointer" onClick={() => setPreviewImage(style.generated_image)}>
                        <img src={style.generated_image} alt={style.style_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" size={24} />
                        </div>
                     </div>
                  ) : (
                    <>
                        <ImageIcon className="text-slate-300 w-8 h-8 group-hover:text-blue-200" />
                        <span className="text-[10px] text-slate-400 mt-2">AI 生成预览占位</span>
                    </>
                  )}
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>
                
                <h4 className="font-bold text-sm mb-1">{style.style_name}</h4>
                <p className="text-[10px] text-slate-400 mb-2 line-clamp-2" title={style.art_style_text}>{style.art_style_text}</p>
                
                <div className="flex-1 min-h-0 mb-2">
                    <EditableText
                    value={style.image_prompt}
                    onSave={(val) => updateCharacterPrompt(charIdx, styleIdx, val)}
                    className="w-full text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2 h-auto min-h-[5rem] hover:border-blue-300 transition cursor-text"
                    textareaClassName="w-full h-auto min-h-[5rem] p-2 text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                </div>
                
                <div className="w-full mt-auto">
                   <button
                        onClick={() => handleGenerateAI(charIdx, styleIdx, style.image_prompt, style.art_style_text)}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                     >
                       {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       AI生成
                     </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      ))}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
            onClick={() => setPreviewImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {isGlobalGenerating && (
        <div className="fixed inset-0 top-[-40px] left-0 w-screen h-screen z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             <p className="font-bold text-lg text-slate-700">正在执行中，不要关闭屏幕，请稍等</p>
          </div>
        </div>
      )}
    </div>
  );
};
