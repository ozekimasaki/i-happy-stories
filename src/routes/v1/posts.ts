import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { generateStory } from '../../services/storyService';

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

  // リクエストボディをパースして検証
  const body = await c.req.json().catch(() => ({})); // パースエラーの場合は空オブジェクト
  const { prompt } = body;

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return c.json({ error: 'A non-empty prompt is required' }, 400);
  }

  try {
    // 物語生成ロジックを呼び出す
    const story = await generateStory(prompt);
    
    return c.json({ message: 'Story created successfully', story: story }, 201);
  } catch (error) {
    console.error('Error generating story:', error);
    return c.json({ error: 'Failed to generate story due to an internal error' }, 500);
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