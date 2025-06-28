import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';

const posts = new Hono();

// 投稿一覧を取得
posts.get('/', (c) => c.json({ posts: [], message: 'Get all posts' }));

// 特定の投稿を取得
posts.get('/:id', (c) => {
  const { id } = c.req.param();
  return c.json({ post: { id }, message: `Get post ${id}` });
});

// 新しい投稿を作成 (認証が必要)
posts.post('/', authMiddleware, (c) => {
  const user = c.get('user');
  console.log('Authenticated user:', user);
  return c.json({ message: 'Create a new post' }, 201);
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