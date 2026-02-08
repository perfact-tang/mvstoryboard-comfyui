export interface StoryboardStep {
  segment_id: number;
  content_narrative: string;
  prompts: {
    first_frame: string;
    last_frame: string;
  };
  start_frame_images?: string[];
  end_frame_images?: string[];
}

export interface Proposal {
  proposal_id: number;
  direction_name: string;
  basics: {
    outline: string;
    shooting_method: string;
    art_style_description: string;
  };
  storyboard: StoryboardStep[];
}

export interface CharacterStyle {
  style_name: string;
  art_style_text: string;
  image_prompt: string;
}

export interface CharacterDesign {
  character_id: string;
  role_name: string;
  character_description: string;
  styling_variations: CharacterStyle[];
}

export interface ProjectData {
  metadata: {
    song_style: string;
    user_ideas: string;
  };
  proposals: Proposal[];
  character_designs: CharacterDesign[];
}
