import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Loader2, X, Maximize2, Download } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { EditableText } from './EditableText';
import { generateComfyImage } from '../utils/comfyApi';

export const ProposalDetail: React.FC = () => {
  const { data, activeProposalIndex, updateData, comfyUiUrl, workflowVersion } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!data) return null;
  const p = data.proposals[activeProposalIndex];

  const updateProposalBasic = (field: 'outline' | 'shooting_method' | 'art_style_description', value: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    newData.proposals[activeProposalIndex].basics[field] = value;
    updateData(newData);
  };

  const updateStoryboard = (stepIndex: number, field: 'content_narrative', value: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    newData.proposals[activeProposalIndex].storyboard[stepIndex][field] = value;
    updateData(newData);
  };

  const updateStoryboardImages = (stepIndex: number, type: 'start' | 'end', images: string[]) => {
    const state = useStore.getState();
    if (!state.data) return;
    const newData = JSON.parse(JSON.stringify(state.data));
    const idx = state.activeProposalIndex;

    if (type === 'start') {
      newData.proposals[idx].storyboard[stepIndex].start_frame_images = images;
    } else {
      newData.proposals[idx].storyboard[stepIndex].end_frame_images = images;
    }
    state.updateData(newData);
  };

  const updateStoryboardPrompt = (stepIndex: number, field: 'first_frame' | 'last_frame', value: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    newData.proposals[activeProposalIndex].storyboard[stepIndex].prompts[field] = value;
    updateData(newData);
  };

  const generateStepImages = async (stepIndex: number, prompt: string, type: 'start' | 'end') => {
    const state = useStore.getState();
    const currentData = state.data;
    if (!currentData) return;
    
    const idx = state.activeProposalIndex;
    const artStyle = currentData.proposals[idx].basics.art_style_description;
    
    const combinedPrompt = `${prompt}, ${artStyle}`;
    const images: string[] = [];

    // Generate Image 1
    const url1 = await generateComfyImage(combinedPrompt, state.comfyUiUrl, workflowVersion);
    images.push(url1);
    updateStoryboardImages(stepIndex, type, [...images]);
  };

  const handleGenerateAI = async (stepIndex: number, prompt: string, type: 'start' | 'end') => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      await generateStepImages(stepIndex, prompt, type);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert(`生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const state = useStore.getState();
      if (!state.data) return;
      const steps = state.data.proposals[state.activeProposalIndex].storyboard;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        // Start Frame
        if (step.prompts.first_frame) {
            await generateStepImages(i, step.prompts.first_frame, 'start');
        }
        // End Frame
        if (step.prompts.last_frame) {
            await generateStepImages(i, step.prompts.last_frame, 'end');
        }
      }
    } catch (error) {
      console.error("Batch generation failed:", error);
      alert(`批量生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadJson = () => {
    const dataToDownload = JSON.parse(JSON.stringify(p));
    dataToDownload.storyboard.forEach((step: any) => {
      delete step.start_frame_images;
      delete step.end_frame_images;
    });

    const jsonString = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${p.direction_name || "proposal"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="col-span-9 space-y-6">
      <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-yellow-500" /> {p.direction_name}
          </h2>
          <button 
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition font-medium"
          >
              <Download size={14} />
              下载此方案Json
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">拍摄大纲</p>
            <EditableText 
              value={p.basics.outline}
              onSave={(val) => updateProposalBasic('outline', val)}
              className="text-sm leading-relaxed text-slate-700 hover:bg-slate-50 rounded p-2 transition border border-transparent hover:border-slate-200"
              textareaClassName="w-full h-auto min-h-[6rem] text-sm text-slate-600 bg-slate-50 border border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">拍摄方法</p>
            <EditableText 
              value={p.basics.shooting_method}
              onSave={(val) => updateProposalBasic('shooting_method', val)}
              className="text-sm leading-relaxed text-slate-700 hover:bg-slate-50 rounded p-2 transition border border-transparent hover:border-slate-200"
              textareaClassName="w-full h-auto min-h-[6rem] text-sm text-slate-600 bg-slate-50 border border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">艺术风格</p>
            <EditableText 
              value={p.basics.art_style_description}
              onSave={(val) => updateProposalBasic('art_style_description', val)}
              className="text-sm leading-relaxed text-slate-700 hover:bg-slate-50 rounded p-2 transition border border-transparent hover:border-slate-200"
              textareaClassName="w-full h-auto min-h-[6rem] text-sm text-slate-600 bg-slate-50 border border-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold">故事脚本分段</h3>
            <button
                onClick={handleGenerateAll}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
                <Sparkles size={14} />
                AI全部生成
            </button>
        </div>
        {p.storyboard.map((step, index) => (
          <div key={step.segment_id} className="glass-card rounded-2xl overflow-hidden shadow-sm flex border border-slate-200 bg-white/80 backdrop-blur">
            <div className="w-16 bg-slate-900 text-white flex flex-col items-center justify-center font-bold">
              <span className="text-xs opacity-50">PART</span>
              {step.segment_id}
            </div>
            <div className="flex-1 p-6 space-y-4">
              <EditableText 
                value={step.content_narrative}
                onSave={(val) => updateStoryboard(index, 'content_narrative', val)}
                className="text-slate-700 font-medium hover:bg-slate-50 rounded p-2 transition border border-transparent hover:border-slate-200"
                textareaClassName="w-full h-auto min-h-[4rem] text-slate-700 font-medium bg-slate-50 border border-slate-200"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="prompt-box relative bg-slate-50 p-3 rounded-lg border border-slate-200 group hover:border-blue-200 transition">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">START FRAME PROMPT</p>
                  <EditableText 
                    value={step.prompts.first_frame}
                    onSave={(val) => updateStoryboardPrompt(index, 'first_frame', val)}
                    className="text-xs text-slate-600 italic hover:bg-white rounded p-1 transition border border-transparent hover:border-blue-100 min-h-[3rem]"
                    textareaClassName="w-full h-auto min-h-[5rem] text-xs text-slate-600 italic bg-white border border-blue-200"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
                    <CopyButton 
                      text={step.prompts.first_frame} 
                      className="bg-white shadow-md p-1 rounded hover:bg-slate-50"
                    />
                  </div>
                </div>
                <div className="prompt-box relative bg-slate-50 p-3 rounded-lg border border-slate-200 group hover:border-blue-200 transition">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">END FRAME PROMPT</p>
                  <EditableText 
                    value={step.prompts.last_frame}
                    onSave={(val) => updateStoryboardPrompt(index, 'last_frame', val)}
                    className="text-xs text-slate-600 italic hover:bg-white rounded p-1 transition border border-transparent hover:border-blue-100 min-h-[3rem]"
                    textareaClassName="w-full h-auto min-h-[5rem] text-xs text-slate-600 italic bg-white border border-blue-200"
                  />
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
                    <CopyButton 
                      text={step.prompts.last_frame} 
                      className="bg-white shadow-md p-1 rounded hover:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Image Previews */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Frame Previews */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate-400">START FRAME PREVIEWS</p>
                     <button
                        onClick={() => handleGenerateAI(index, step.prompts.first_frame, 'start')}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                     >
                       <Sparkles size={12} />
                       AI生成
                     </button>
                   </div>
                   <div className="space-y-2">
                     {[0].map((i) => (
                       <div key={`start-${i}`} className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center group hover:border-blue-200 transition overflow-hidden relative">
                          {step.start_frame_images && step.start_frame_images[i] ? (
                            <div className="relative w-full h-full group/image cursor-pointer" onClick={() => setPreviewImage(step.start_frame_images![i])}>
                                <img src={step.start_frame_images[i]} alt={`Generated ${i+1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                                    <Maximize2 className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" size={24} />
                                </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mb-1 group-hover:bg-blue-100 group-hover:text-blue-500 transition">
                              <span className="text-[10px] font-bold">{i + 1}</span>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                </div>

                {/* End Frame Previews */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate-400">END FRAME PREVIEWS</p>
                     <button
                        onClick={() => handleGenerateAI(index, step.prompts.last_frame, 'end')}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                     >
                       <Sparkles size={12} />
                       AI生成
                     </button>
                   </div>
                   <div className="space-y-2">
                     {[0].map((i) => (
                       <div key={`end-${i}`} className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center group hover:border-blue-200 transition overflow-hidden relative">
                          {step.end_frame_images && step.end_frame_images[i] ? (
                            <div className="relative w-full h-full group/image cursor-pointer" onClick={() => setPreviewImage(step.end_frame_images![i])}>
                                <img src={step.end_frame_images[i]} alt={`Generated End ${i+1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                                    <Maximize2 className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" size={24} />
                                </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mb-1 group-hover:bg-blue-100 group-hover:text-blue-500 transition">
                              <span className="text-[10px] font-bold">{i + 1}</span>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             <p className="font-bold text-lg text-slate-700">正在执行中，不要关闭屏幕，请稍等</p>
          </div>
        </div>
      )}

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
    </main>
  );
};
