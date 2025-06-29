import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { createStory, getStoriesByUserId, getStoryById } from '../../services/storyService';
import { createIllustration } from '../../services/illustrationService';
import { storyRequestSchema } from '../../schemas/storySchema';

const posts = new Hono();

// 投稿一覧を取得
posts.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  try {
    const stories = await getStoriesByUserId(c, user.id);
    return c.json({ stories: stories, message: '物語一覧を取得しました' });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return c.json({ error: '物語一覧の取得に失敗しました' }, 500);
  }
});

// 特定の投稿を取得
posts.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    const story = await getStoryById(c, id, user.id);
    if (!story) {
      return c.json({ error: '物語が見つかりません' }, 404);
    }
    return c.json({ story: story, message: `物語(ID:${id})を取得しました` });
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    return c.json({ error: '物語の取得に失敗しました' }, 500);
  }
});

// 新しい投稿を作成 (認証が必要)
posts.post('/', authMiddleware, async (c) => {
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
    // 1. 物語とイラスト用プロンプトを同時に生成
    const { story, illustrationPrompt } = await createStory(c, prompt);
    
    let illustration = null;
    
    try {
      // 2. AIが生成したプロンプトを使ってイラストを生成
      console.log(`Generating illustration with prompt: "${illustrationPrompt}"`);
      illustration = await createIllustration(c, story.id, illustrationPrompt);
    } catch (illustrationError) {
      console.error('Failed to create illustration, but story was saved:', illustrationError);
      // イラスト生成が失敗しても、物語は成功しているのでエラーは返さない
    }

    return c.json({ 
      message: '物語とイラストのプロンプトを作成しました。イラストの生成には時間がかかる場合があります。', 
      story: story,
      illustration: illustration
    }, 201);

  } catch (error) {
    console.error('Error in post creation endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return c.json({ error: `物語またはイラストの作成に失敗しました: ${errorMessage}` }, 500);
  }
});

// 投稿を更新
posts.put('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `投稿(ID:${id})を更新しました` });
});

// 投稿を削除
posts.delete('/:id', (c) => {
    const { id } = c.req.param();
    return c.json({ message: `投稿(ID:${id})を削除しました` });
});

export default posts;