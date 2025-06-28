import { Hono } from 'hono';

const users = new Hono();

// ユーザー一覧を取得
users.get('/', (c) => c.json({ users: [], message: 'Get all users' }));

// 特定のユーザーを取得
users.get('/:id', (c) => {
  const { id } = c.req.param();
  return c.json({ user: { id }, message: `Get user ${id}` });
});

// 新しいユーザーを作成
users.post('/', (c) => c.json({ message: 'Create a new user' }, 201));

// ユーザーを更新
users.put('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `Update user ${id}` });
});

// ユーザーを削除
users.delete('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `Delete user ${id}` });
});

export default users; 