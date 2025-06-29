import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { createStory } from '../../services/storyService';
import { createIllustration } from '../../services/illustrationService';
import { storyRequestSchema } from '../../schemas/storySchema';

const posts = new Hono();

// 投稿一覧を取得
posts.get('/', (c) => c.json({ posts: [], message: 'Get all posts' }));

// 特定の投稿を取得
posts.get('/:id', (c) => {
  const { id } = c.req.param();
  return c.json({ post: { id }, message: `Get post ${id}` });
});

// 新しい投稿を作成 (認証が必要)
posts.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  console.log('Authenticated user:', user);

  const body = await c.req.json().catch(() => ({}));

  const validationResult = storyRequestSchema.safeParse(body);

  if (!validationResult.success) {
    const formattedErrors = validationResult.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return c.json({ errors: formattedErrors }, 400);
  }
  
  const { prompt } = validationResult.data;
  try {
    // 1. 物語を生成・保存
    const story = await createStory(c, prompt);
    let illustration = null;
    
    try {
      // 2. 物語のキーシーンに基づいたイラストを生成・保存
      const illustrationPrompt = `この物語の重要な場面を表現するイラストを生成してください。スタイルはアニメ風でお願いします。: ${story.content.substring(0, 500)}`;
      illustration = await createIllustration(c, story.id, illustrationPrompt);
    } catch (illustrationError) {
      console.error('Failed to create illustration, but story was saved:', illustrationError);
      // イラスト生成が失敗しても、物語は成功しているので、エラーは返さない
    }

    return c.json({ 
      message: 'Story created successfully. Illustration creation status may vary.', 
      story: story,
      illustration: illustration
    }, 201);

  } catch (error) {
    console.error('Error in post creation endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: `Failed to create story or illustration: ${errorMessage}` }, 500);
  }
});

// 投稿を更新
posts.put('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `Update post ${id}` });
});

// 投稿を削除
posts.delete('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `Delete post ${id}` });
});


export default posts; 