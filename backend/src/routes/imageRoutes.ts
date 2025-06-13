import { Request, Response, Router } from 'express';
import OpenAI from 'openai';

const router = Router();

interface ImageGenerateRequest {
  prompt: string;
  style?: string;
}

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI DALL-E 图片生成端点
// 仅支持 OpenAI DALL-E 模型
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style } = req.body as ImageGenerateRequest;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // 检查是否配置了OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({
        error: 'OpenAI API key not configured',
        message: '请在环境变量中配置 OPENAI_API_KEY。仅支持 OpenAI DALL-E 模型。',
      });
      return;
    }

    console.log(
      `[ImageAPI] Generating image with OpenAI DALL-E for prompt: "${prompt}" with style: "${style}"`
    );

    // 根据风格调整提示词
    let enhancedPrompt = prompt;
    if (style) {
      const styleMap: { [key: string]: string } = {
        simple: 'simple, clean, minimalist style',
        cartoon: 'cartoon style, colorful, fun',
        sketch: 'pencil sketch style, black and white',
        doodle: 'hand-drawn doodle style, casual, playful',
        minimalist: 'minimalist style, simple lines, clean design',
      };

      const styleDescription = styleMap[style] || style;
      enhancedPrompt = `${prompt}, ${styleDescription}`;
    }

    // 调用OpenAI DALL-E API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    res.json({
      imageUrl: imageUrl,
      prompt: prompt,
      enhancedPrompt: enhancedPrompt,
      style: style,
      message: '图片由 OpenAI DALL-E 3 生成',
      provider: 'OpenAI DALL-E 3',
    });
  } catch (error: any) {
    console.error('[ImageAPI] Error generating image with OpenAI:', error);

    // 处理OpenAI特定错误
    if (error?.error?.code === 'invalid_api_key') {
      res.status(401).json({
        error: 'Invalid OpenAI API key',
        message: 'OpenAI API密钥无效，请检查配置。仅支持 OpenAI DALL-E 模型。',
      });
      return;
    }

    if (error?.error?.code === 'insufficient_quota') {
      res.status(429).json({
        error: 'OpenAI quota exceeded',
        message: 'OpenAI API配额不足，请检查账户余额。仅支持 OpenAI DALL-E 模型。',
      });
      return;
    }

    if (error?.error?.code === 'content_policy_violation') {
      res.status(400).json({
        error: 'Content policy violation',
        message: '提示内容违反了OpenAI内容政策，请修改后重试。仅支持 OpenAI DALL-E 模型。',
      });
      return;
    }

    res.status(500).json({
      error: '涂鸦灵感生成失败，可能是我的画笔没墨了。',
      message: error?.message || 'Unknown error',
      provider: 'OpenAI DALL-E 3 (仅支持 OpenAI)',
      details: '请检查OpenAI API配置和网络连接',
    });
  }
});

export default router;
