import { ProjectData } from '../types';

export const sampleData: ProjectData = {
  metadata: { song_style: "Synthwave / 城市流行", user_ideas: "霓虹灯、深夜驾驶、破碎的记忆" },
  proposals: Array.from({ length: 5 }, (_, i) => ({
    proposal_id: i + 1,
    direction_name: ["复古霓虹梦境", "黑白极简纪实", "赛博朋克都市", "抽象光影表现", "都市公路电影"][i],
    basics: {
      outline: "这是一个关于在深夜城市中寻找遗忘记忆的故事。视觉上强调高饱和度的红蓝对比。",
      shooting_method: "采用大量的低角度手持拍摄，增加不稳定性感。使用1.33x变形宽银幕镜头。",
      art_style_description: "视觉灵感源自《银翼杀手》与王家卫的电影色彩。"
    },
    storyboard: [
      { 
        segment_id: 1, 
        content_narrative: "主角坐在雨后的便利店门口，看着霓虹灯闪烁。", 
        prompts: { 
          first_frame: "Cinematic shot, lonely man sitting in front of neon convenience store, puddles on ground, high contrast, 8k", 
          last_frame: "Close up of blinking neon sign reflection in eye, sharp focus" 
        }
      },
      { 
        segment_id: 2, 
        content_narrative: "回忆闪回：在舞厅中模糊的身影。", 
        prompts: { 
          first_frame: "Blurry dance floor, disco lights, motion blur, 80s aesthetic", 
          last_frame: "Abstract light streaks, warm colors" 
        }
      },
      { 
        segment_id: 3, 
        content_narrative: "主角驾驶着跑车穿过隧道。", 
        prompts: { 
          first_frame: "Interior of vintage car, dashboard glowing, tunnel lights passing by fast", 
          last_frame: "Car exiting tunnel, blinding light" 
        }
      }
    ]
  })),
  character_designs: [
    {
      character_id: "char_01", 
      role_name: "迷失的旅人", 
      character_description: "25岁左右，面容疲惫但眼神锐利。",
      styling_variations: Array.from({ length: 5 }, (_, i) => ({
        style_name: ["都市浪人", "赛博黑客", "复古绅士", "未来废土", "街头艺术"][i],
        art_style_text: "融合了皮革与透气科技面料的实验风格。",
        image_prompt: "Portrait of a young man wearing techwear jacket, neon light highlights on face, cyberpunk style"
      }))
    }
  ]
};
