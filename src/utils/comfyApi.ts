
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate image via ComfyUI directly from the browser
 * @param promptText Positive prompt
 * @param serverUrl ComfyUI server URL (e.g. 192.168.0.138:8188)
 * @param workflowVersion Workflow version to use
 * @returns Promise<string> Image URL
 */
export const generateComfyImage = async (promptText: string, serverUrl?: string, workflowVersion: string = 'Qwen-Image-2512'): Promise<string> => {
  // Clean up server URL
  const serverAddress = (serverUrl || '192.168.0.138:8188').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const clientId = uuidv4();

  // Determine if we should use the proxy
  // If we are in development mode AND the serverAddress matches our proxy target, use the proxy path.
  // Note: import.meta.env.DEV works in Vite.
  const useProxy = import.meta.env.DEV && serverAddress.includes('192.168.0.138:8188');
  
  // For WebSocket, we generally use the direct address because WS usually bypasses CORS easier,
  // or Vite proxy for WS is tricky. Let's try direct WS first as per logs it was connecting.
  // If WS fails, we might need to proxy WS too, but let's stick to what was working.
  const wsAddress = serverAddress;
  
  // For HTTP API calls, use proxy if applicable to avoid CORS
  const apiBaseUrl = useProxy ? '/comfy-api' : `http://${serverAddress}`;

  // Workflow definition
  let workflow: any;
  let outputNodeId: string;

  if (workflowVersion === 'Z-Image-Turbo') {
      outputNodeId = "9";
      workflow = {
          "9": {
              "inputs": {
                  "filename_prefix": "z-image",
                  "images": [
                      "43",
                      0
                  ]
              },
              "class_type": "SaveImage",
              "_meta": {
                  "title": "保存图像"
              }
          },
          "39": {
              "inputs": {
                  "clip_name": "qwen_3_4b.safetensors",
                  "type": "lumina2",
                  "device": "default"
              },
              "class_type": "CLIPLoader",
              "_meta": {
                  "title": "加载CLIP"
              }
          },
          "40": {
              "inputs": {
                  "vae_name": "ae.safetensors"
              },
              "class_type": "VAELoader",
              "_meta": {
                  "title": "加载VAE"
              }
          },
          "41": {
              "inputs": {
                  "width": 1920,
                  "height": 1088,
                  "batch_size": 1
              },
              "class_type": "EmptySD3LatentImage",
              "_meta": {
                  "title": "空Latent图像（SD3）"
              }
          },
          "42": {
              "inputs": {
                  "conditioning": [
                      "45",
                      0
                  ]
              },
              "class_type": "ConditioningZeroOut",
              "_meta": {
                  "title": "条件零化"
              }
          },
          "43": {
              "inputs": {
                  "samples": [
                      "44",
                      0
                  ],
                  "vae": [
                      "40",
                      0
                  ]
              },
              "class_type": "VAEDecode",
              "_meta": {
                  "title": "VAE解码"
              }
          },
          "44": {
              "inputs": {
                  "seed": Math.floor(Math.random() * 1000000000000000),
                  "steps": 9,
                  "cfg": 1,
                  "sampler_name": "res_multistep",
                  "scheduler": "simple",
                  "denoise": 1,
                  "model": [
                      "47",
                      0
                  ],
                  "positive": [
                      "45",
                      0
                  ],
                  "negative": [
                      "42",
                      0
                  ],
                  "latent_image": [
                      "41",
                      0
                  ]
              },
              "class_type": "KSampler",
              "_meta": {
                  "title": "K采样器"
              }
          },
          "45": {
              "inputs": {
                  "text": promptText,
                  "clip": [
                      "39",
                      0
                  ]
              },
              "class_type": "CLIPTextEncode",
              "_meta": {
                  "title": "CLIP文本编码"
              }
          },
          "46": {
              "inputs": {
                  "unet_name": "z_image_turbo_bf16.safetensors",
                  "weight_dtype": "default"
              },
              "class_type": "UNETLoader",
              "_meta": {
                  "title": "UNet加载器"
              }
          },
          "47": {
              "inputs": {
                  "shift": 3,
                  "model": [
                      "46",
                      0
                  ]
              },
              "class_type": "ModelSamplingAuraFlow",
              "_meta": {
                  "title": "采样算法（AuraFlow）"
              }
          }
      };
  } else {
      // Default: Qwen-Image-2512
      outputNodeId = "90";
      workflow = {
          "90": {
              "inputs": {
              "filename_prefix": "Qwen-Image-2512",
              "images": ["92:8", 0]
              },
              "class_type": "SaveImage",
              "_meta": { "title": "保存图像" }
          },
          "91": {
              "inputs": { "value": promptText },
              "class_type": "PrimitiveStringMultiline",
              "_meta": { "title": "Prompt" }
          },
          "92:39": {
              "inputs": { "vae_name": "qwen_image_vae.safetensors" },
              "class_type": "VAELoader",
              "_meta": { "title": "加载VAE" }
          },
          "92:38": {
              "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" },
              "class_type": "CLIPLoader",
              "_meta": { "title": "加载CLIP" }
          },
          "92:66": {
              "inputs": { "shift": 3.1, "model": ["92:73", 0] },
              "class_type": "ModelSamplingAuraFlow",
              "_meta": { "title": "采样算法（AuraFlow）" }
          },
          "92:6": {
              "inputs": { "text": ["91", 0], "clip": ["92:38", 0] },
              "class_type": "CLIPTextEncode",
              "_meta": { "title": "CLIP Text Encode (Positive Prompt)" }
          },
          "92:8": {
              "inputs": { "samples": ["92:3", 0], "vae": ["92:39", 0] },
              "class_type": "VAEDecode",
              "_meta": { "title": "VAE解码" }
          },
          "92:58": {
              "inputs": { "width": 1664, "height": 928, "batch_size": 1 },
              "class_type": "EmptySD3LatentImage",
              "_meta": { "title": "空Latent图像（SD3）" }
          },
          "92:7": {
              "inputs": { "text": "低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲", "clip": ["92:38", 0] },
              "class_type": "CLIPTextEncode",
              "_meta": { "title": "CLIP Text Encode (Negative Prompt)" }
          },
          "92:73": {
              "inputs": { "lora_name": "Qwen-Image-Lightning-4steps-V1.0.safetensors", "strength_model": 1, "model": ["92:37", 0] },
              "class_type": "LoraLoaderModelOnly",
              "_meta": { "title": "LoRA加载器（仅模型）" }
          },
          "92:37": {
              "inputs": { "unet_name": "qwen_image_2512_fp8_e4m3fn.safetensors", "weight_dtype": "default" },
              "class_type": "UNETLoader",
              "_meta": { "title": "UNet加载器" }
          },
          "92:3": {
              "inputs": {
              "seed": Math.floor(Math.random() * 1000000000000000),
              "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1,
              "model": ["92:66", 0], "positive": ["92:6", 0], "negative": ["92:7", 0], "latent_image": ["92:58", 0]
              },
              "class_type": "KSampler",
              "_meta": { "title": "K采样器" }
          }
      };
  }

  // Use a Promise to handle the WebSocket async flow
  return new Promise<string>((resolve, reject) => {
      const ws = new WebSocket(`ws://${wsAddress}/ws?clientId=${clientId}`);
      let promptId: string | null = null;
      let connectionEstablished = false;
      
      // Connection timeout (fail fast if server is unreachable)
      const connectionTimeout = setTimeout(() => {
          if (!connectionEstablished) {
             ws.close();
             reject(new Error(`无法连接到 ComfyUI WebSocket (${wsAddress})。请检查：\n1. ComfyUI 是否已启动？\n2. 端口是否正确？\n3. 是否添加了 --listen 参数？`));
          }
      }, 5000); // 5 seconds connection timeout

      // Execution timeout removed as per user request (ComfyUI generation takes long)


      ws.onopen = async () => {
          connectionEstablished = true;
          clearTimeout(connectionTimeout);
          
          try {
              // Submit task via HTTP to ComfyUI
              // Use apiBaseUrl which might be the proxy path
              const response = await fetch(`${apiBaseUrl}/prompt`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: workflow, client_id: clientId })
              });

              if (!response.ok) {
                  throw new Error(`ComfyUI HTTP error! status: ${response.status} (URL: ${apiBaseUrl}/prompt)`);
              }

              const data = await response.json();
              promptId = data.prompt_id;
              console.log(`[Frontend] Task submitted, ID: ${promptId}`);
          } catch (err: any) {
              ws.close();
              // Add a hint about CORS if fetch fails
              const corsHint = err.message.includes('Failed to fetch') 
                  ? '\n\n提示: 这是一个网络请求错误 (CORS)。\n1. 请确保 ComfyUI 添加了 --enable-cors-header 参数。\n2. 或者尝试刷新页面以使用内置代理。'
                  : '';
              reject(new Error(`任务提交失败: ${err.message}${corsHint}`));
          }
      };

      ws.onmessage = (event) => {
          try {
              const message = JSON.parse(event.data as string);

              if (message.type === 'executing') {
                  if (message.data.prompt_id === promptId) {
                      // console.log(`[Frontend] Executing node: ${message.data.node}`);
                  }
              }

              if (message.type === 'executed' && message.data.prompt_id === promptId) {
                  const { node, output } = message.data;
                  // Check for SaveImage node
                  if (node === outputNodeId) {
                      const images = output.images;
                      if (images && images.length > 0) {
                          const img = images[0];
                          // Construct URL
                          // If using proxy, we should probably also proxy the view URL or use direct if possible
                          // Images are usually GET requests which are easier with CORS if opened directly,
                          // but for <img> tag inside app, it needs to be accessible.
                          // Let's use apiBaseUrl for view as well if it's a proxy.
                          const viewUrl = `${apiBaseUrl}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`;
                          
                          ws.close();
                          resolve(viewUrl);
                      }
                  }
              }

              if (message.type === 'execution_error') {
                  ws.close();
                  reject(new Error(`ComfyUI 执行错误: ${JSON.stringify(message.data)}`));
              }
          } catch (e) {
              console.error('[Frontend] Error parsing WebSocket message:', e);
          }
      };

      ws.onerror = (err) => {
          // If we haven't connected yet, the connectionTimeout might handle it, but onerror usually fires first on ECONNREFUSED
          if (!connectionEstablished) {
             clearTimeout(connectionTimeout);
             console.error('[Frontend] WebSocket connection error:', err);
             reject(new Error(`无法连接到 ComfyUI WebSocket (${wsAddress})。\n请确保 ComfyUI 正在运行并添加了 --listen 参数。`));
          } else {
             // If error happens after connection (e.g. network drop)
             console.error('[Frontend] WebSocket runtime error:', err);
             // Don't reject immediately if it's just a transient error, but usually WS error is fatal
             reject(new Error('WebSocket 连接发生错误'));
          }
      };
      
      ws.onclose = () => {
           // If closed without resolving, it might be an issue unless resolved already
      };
  });
};
