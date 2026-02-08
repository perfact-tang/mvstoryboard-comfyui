import { create } from 'zustand';
import { ProjectData } from '../types';

interface AppState {
  data: ProjectData | null;
  activeTab: 'proposals' | 'characters';
  activeProposalIndex: number;
  isModalOpen: boolean;
  comfyUiUrl: string;
  workflowVersion: string;
  isGeneratingAll: boolean;
  
  setData: (data: ProjectData) => void;
  updateData: (data: ProjectData) => void;
  setActiveTab: (tab: 'proposals' | 'characters') => void;
  setActiveProposalIndex: (index: number) => void;
  setModalOpen: (isOpen: boolean) => void;
  setWorkflowVersion: (version: string) => void;
  setIsGeneratingAll: (isGenerating: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  data: null,
  activeTab: 'proposals',
  activeProposalIndex: 0,
  isModalOpen: false,
  comfyUiUrl: import.meta.env.VITE_COMFY_API_URL || 'http://127.0.0.1:8188',
  workflowVersion: 'Qwen-Image-2512',
  isGeneratingAll: false,

  setData: (data) => set({ data, activeProposalIndex: 0 }),
  updateData: (data) => set({ data }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveProposalIndex: (activeProposalIndex) => set({ activeProposalIndex }),
  setModalOpen: (isModalOpen) => set({ isModalOpen }),
  setWorkflowVersion: (workflowVersion) => set({ workflowVersion }),
  setIsGeneratingAll: (isGeneratingAll) => set({ isGeneratingAll }),
}));
