import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ProposalList } from './ProposalList';
import { ProposalDetail } from './ProposalDetail';
import { CharacterList } from './CharacterList';
import { clsx } from 'clsx';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateComfyImage } from '../utils/comfyApi';

export const Dashboard: React.FC = () => {
  const { activeTab, setActiveTab, isGeneratingAll, setIsGeneratingAll } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Effect to listen for global generation request from Header
  React.useEffect(() => {
    if (isGeneratingAll) {
      handleGenerateAllContent();
    }
  }, [isGeneratingAll]);

  const updateGlobalStoryboardImages = (proposalIndex: number, stepIndex: number, type: 'start' | 'end', images: string[]) => {
    const state = useStore.getState();
    if (!state.data) return;
    const newData = JSON.parse(JSON.stringify(state.data));
    
    if (type === 'start') {
      newData.proposals[proposalIndex].storyboard[stepIndex].start_frame_images = images;
    } else {
      newData.proposals[proposalIndex].storyboard[stepIndex].end_frame_images = images;
    }
    state.updateData(newData);
  };

  const handleGenerateAllProposals = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const state = useStore.getState();
    if (!state.data) return;

    try {
        const proposals = state.data.proposals;
        for (let pIndex = 0; pIndex < proposals.length; pIndex++) {
            const proposal = proposals[pIndex];
            const steps = proposal.storyboard;
            const artStyle = proposal.basics.art_style_description;

            for (let sIndex = 0; sIndex < steps.length; sIndex++) {
                const step = steps[sIndex];
                
                // Generate Start Frame
                if (step.prompts.first_frame) {
                    const combinedPrompt = `${step.prompts.first_frame}, ${artStyle}`;
                    const images: string[] = [];
                    const url1 = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
                    images.push(url1);
                    updateGlobalStoryboardImages(pIndex, sIndex, 'start', [...images]);
                }

                // Generate End Frame
                if (step.prompts.last_frame) {
                    const combinedPrompt = `${step.prompts.last_frame}, ${artStyle}`;
                    const images: string[] = [];
                    const url1 = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
                    images.push(url1);
                    updateGlobalStoryboardImages(pIndex, sIndex, 'end', [...images]);
                }
            }
        }
    } catch (error) {
        console.error("Global Proposals generation failed:", error);
        alert(`方案全量生成失败: ${error}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateAllContent = async () => {
    if (isGenerating) {
        setIsGeneratingAll(false);
        return;
    }
    setIsGenerating(true);
    const state = useStore.getState();
    if (!state.data) return;

    try {
        // 1. Generate All Proposals (Storyboard Images)
        const proposals = state.data.proposals;
        for (let pIndex = 0; pIndex < proposals.length; pIndex++) {
            const proposal = proposals[pIndex];
            const steps = proposal.storyboard;
            const artStyle = proposal.basics.art_style_description;

            for (let sIndex = 0; sIndex < steps.length; sIndex++) {
                const step = steps[sIndex];
                
                // Generate Start Frame
                if (step.prompts.first_frame) {
                    const combinedPrompt = `${step.prompts.first_frame}, ${artStyle}`;
                    const images: string[] = [];
                    // Generate 1 image
                    const url1 = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
                    images.push(url1);
                    updateGlobalStoryboardImages(pIndex, sIndex, 'start', [...images]);
                }

                // Generate End Frame
                if (step.prompts.last_frame) {
                    const combinedPrompt = `${step.prompts.last_frame}, ${artStyle}`;
                    const images: string[] = [];
                    // Generate 1 image
                    const url1 = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
                    images.push(url1);
                    updateGlobalStoryboardImages(pIndex, sIndex, 'end', [...images]);
                }
            }
        }

        // 2. Generate All Characters (Styling Variations)
        const characters = state.data.character_designs;
        for (let charIndex = 0; charIndex < characters.length; charIndex++) {
            const char = characters[charIndex];
            const styles = char.styling_variations;

            for (let styleIndex = 0; styleIndex < styles.length; styleIndex++) {
                const style = styles[styleIndex];
                const combinedPrompt = `${style.image_prompt}, ${style.art_style_text}`;
                const imageUrl = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
                updateGlobalCharacterImage(charIndex, styleIndex, imageUrl);
            }
        }

    } catch (error) {
      console.error("Global All Content generation failed:", error);
      alert(`全量生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
      setIsGeneratingAll(false);
    }
  };

  const updateGlobalCharacterImage = (charIndex: number, styleIndex: number, imageUrl: string) => {
    const state = useStore.getState();
    if (!state.data) return;
    const newData = JSON.parse(JSON.stringify(state.data));
    if (!newData.character_designs[charIndex].styling_variations[styleIndex].generated_image) {
         newData.character_designs[charIndex].styling_variations[styleIndex].generated_image = "";
    }
    newData.character_designs[charIndex].styling_variations[styleIndex].generated_image = imageUrl;
    state.updateData(newData);
  };

  const handleGenerateAllCharacters = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const state = useStore.getState();
      if (!state.data) return;
      const characters = state.data.character_designs;

      for (let charIndex = 0; charIndex < characters.length; charIndex++) {
        const char = characters[charIndex];
        const styles = char.styling_variations;

        for (let styleIndex = 0; styleIndex < styles.length; styleIndex++) {
           const style = styles[styleIndex];
           const combinedPrompt = `${style.image_prompt}, ${style.art_style_text}`;
           const imageUrl = await generateComfyImage(combinedPrompt, state.comfyUiUrl, state.workflowVersion);
           updateGlobalCharacterImage(charIndex, styleIndex, imageUrl);
        }
      }
    } catch (error) {
      console.error("Global Character Batch generation failed:", error);
      alert(`全量生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGlobalGenerate = () => {
    if (activeTab === 'proposals') {
        handleGenerateAllProposals();
    } else {
        handleGenerateAllCharacters();
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 items-center justify-between">
        <div className="flex">
            <button
            onClick={() => setActiveTab('proposals')}
            className={clsx(
                "px-6 py-3 font-medium transition",
                activeTab === 'proposals' ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-500 hover:text-slate-700"
            )}
            >
            拍摄方案 (5组)
            </button>
            <button
            onClick={() => setActiveTab('characters')}
            className={clsx(
                "px-6 py-3 font-medium transition",
                activeTab === 'characters' ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-500 hover:text-slate-700"
            )}
            >角色定妆</button>
        </div>
        
        {/* Global Generate Button */}
        <div className="px-4">
             <button
                onClick={handleGlobalGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-md"
            >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {activeTab === 'proposals' ? 'AI生成全部故事图片' : 'AI生成全部定妆照'}
            </button>
        </div>
      </div>

      {/* View 1: Proposals */}
      <div className={clsx("grid grid-cols-12 gap-6", activeTab !== 'proposals' && "hidden")}>
        <ProposalList />
        <ProposalDetail />
      </div>

      {/* View 2: Characters */}
      <div className={clsx("space-y-10", activeTab !== 'characters' && "hidden")}>
        <CharacterList />
      </div>

       {isGenerating && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 max-w-sm text-center">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">正在全量生成中</h3>
                <p className="text-slate-500">
                    {isGeneratingAll
                        ? "正在全量生成所有内容（故事板图片 + 角色定妆照），这可能需要较长时间，请保持页面开启..."
                        : activeTab === 'proposals' 
                            ? "正在为所有方案生成故事板图片，这可能需要几分钟时间，请保持页面开启..." 
                            : "正在为所有角色生成定妆照，这可能需要几分钟时间，请保持页面开启..."}
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
