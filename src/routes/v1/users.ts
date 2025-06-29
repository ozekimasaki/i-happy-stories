import { Hono } from 'hono';

const users = new Hono();

// ユーザー一覧を取得
users.get('/', (c) => c.json({ users: [], message: 'すべてのユーザーを取得しました' }));

// 特定のユーザーを取得
users.get('/:id', (c) => {
  const { id } = c.req.param();
  return c.json({ user: { id }, message: `ユーザー(ID:${id})を取得しました` });
});

// 新しいユーザーを作成
users.post('/', (c) => c.json({ message: '新しいユーザーを作成しました' }, 201));

// ユーザーを更新
users.put('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `ユーザー(ID:${id})を更新しました` });
});

// ユーザーを削除
users.delete('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `ユーザー(ID:${id})を削除しました` });
});

export default users; 