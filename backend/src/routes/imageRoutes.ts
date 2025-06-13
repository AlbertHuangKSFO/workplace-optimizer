import { Request, Response, Router } from 'express';

const router = Router();

interface ImageGenerateRequest {
  prompt: string;
  style?: string;
}

// 占位符图片生成端点
// 在实际部署中，这里应该集成真实的AI图片生成服务，如：
// - OpenAI DALL-E
// - Stability AI
// - Midjourney API
// - 本地部署的Stable Diffusion
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, style } = req.body as ImageGenerateRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[ImageAPI] Generating image for prompt: "${prompt}" with style: "${style}"`);

    // 模拟AI图片生成延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 返回占位符图片URL
    // 这里使用了一个提供占位符图片的服务
    const placeholderImages = [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=4',
      'https://picsum.photos/400/300?random=5',
    ];

    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    res.json({
      imageUrl: randomImage,
      prompt: prompt,
      style: style,
      message: '这是一个占位符图片。在实际部署中，这里会返回AI生成的真实涂鸦图片。',
    });
  } catch (error) {
    console.error('[ImageAPI] Error generating image:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
