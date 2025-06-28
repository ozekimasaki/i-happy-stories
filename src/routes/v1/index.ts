import { Hono } from 'hono';
import posts from './posts';
import users from './users';

const v1 = new Hono();

v1.route('/posts', posts);
v1.route('/users', users);

export default v1; 