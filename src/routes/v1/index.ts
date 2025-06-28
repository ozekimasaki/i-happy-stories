import { Hono } from 'hono';
import posts from './posts';
import users from './users';
import auth from './auth';
import { authMiddleware } from '../../middleware/auth';

const v1 = new Hono();

v1.route('/posts', posts);
v1.route('/users', users);
v1.route('/auth', auth);

// このルートは認証が必要です
v1.get('/me', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

export default v1; 