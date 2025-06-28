import { Hono } from 'hono';
import posts from './posts';
import users from './users';
import auth from './auth';

const v1 = new Hono();

v1.route('/posts', posts);
v1.route('/users', users);
v1.route('/auth', auth);

export default v1; 