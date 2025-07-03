import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth';
import { createStory, getStoriesByUserId, getStoryById, deleteStory, updateStory, getLatestStories, publishStory, unpublishStory, generateStoryAudio, deleteStoryAudio } from '../../services/storyService';
import { createIllustration } from '../../services/illustrationService';
import { storyRequestSchema, storyUpdateSchema, audioRequestSchema } from '../../schemas/storySchema';

const posts = new Hono();

// ログインユーザーの最新の投稿3件を取得
posts.get('/latest', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  try {
        const stories = await getLatestStories(c, user.id);
    return c.json({ stories: stories, message: '最新の物語を3件取得しました' });
  } catch (error) {
    console.error('Error fetching latest stories:', error);
    return c.json({ error: '最新の物語の取得に失敗しました' }, 500);
  }
});

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



// 特定の投稿を取得 (認証はオプション)
// RLSポリシーにより、公開物語もしくは自分の物語のみ取得可能
posts.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'), 10);

  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    // サービス層ではuserIdをチェックしない。RLSに任せる。
    const story = await getStoryById(c, id);
    return c.json({ story: story, message: `物語(ID:${id})を取得しました` });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    console.error(`Error fetching story ${id}:`, error);
    if (errorMessage.includes('見つかりません')) {
      return c.json({ error: errorMessage }, 404);
    }
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
  
  const { prompt, age, length } = validationResult.data;
  try {
    // 1. 物語とイラスト用プロンプトを同時に生成
    const { story, illustrationPrompt } = await createStory(c, prompt, age, length);
    
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
posts.put('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const validationResult = storyUpdateSchema.safeParse(body);

  if (!validationResult.success) {
    const formattedErrors = validationResult.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return c.json({ errors: formattedErrors }, 400);
  }

  try {
    const updatedStory = await updateStory(c, id, user.id, validationResult.data);
    return c.json({ story: updatedStory, message: '物語を更新しました' });
  } catch (error: unknown) {
    console.error(`Error updating story ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
        return c.json({ error: errorMessage }, 404);
    }
    
    return c.json({ error: '物語の更新中にサーバーエラーが発生しました' }, 500);
  }
});

// 物語を公開
posts.patch('/:id/publish', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    const publishedStory = await publishStory(c, id, user.id);
    return c.json({ story: publishedStory, message: '物語を公開しました' });
  } catch (error: unknown) {
    console.error(`Error publishing story ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
        return c.json({ error: errorMessage }, 404);
    }
    
    return c.json({ error: '物語の公開中にサーバーエラーが発生しました' }, 500);
  }
});

// 物語を非公開にする
posts.patch('/:id/unpublish', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    const unpublishedStory = await unpublishStory(c, id, user.id);
    return c.json({ story: unpublishedStory, message: '物語を非公開にしました。' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    console.error(`Error unpublishing story ${id}:`, error);
    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
        return c.json({ error: errorMessage }, 404);
    }
    return c.json({ error: '物語の非公開中にサーバーエラーが発生しました' }, 500);
  }
});

// 投稿を削除
// 音声ファイルを生成する
posts.post('/:id/generate-audio', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const validationResult = audioRequestSchema.safeParse(body);

  if (!validationResult.success) {
    const formattedErrors = validationResult.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return c.json({ errors: formattedErrors }, 400);
  }

  try {
    // [デバッグ] 非同期処理を待機して、実行されるか確認する
    console.log(`[Router] Calling generateStoryAudio for story ${id} and awaiting...`);
    await generateStoryAudio(c, id, user.id, validationResult.data.voice);
    console.log(`[Router] Finished awaiting generateStoryAudio for story ${id}.`);

    // 完了したことを示す 200 OK を返す
    return c.json({ message: '音声の生成が完了しました。' }, 200);
  } catch (error: unknown) {
    console.error(`Error starting audio generation for story ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';

    // 同期的に発生しうるエラー（物語が見つからない、権限がないなど）をハンドリング
    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
      return c.json({ error: errorMessage }, 404);
    }

    return c.json({ error: `音声生成の開始に失敗しました: ${errorMessage}` }, 500);
  }
});

posts.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    const result = await deleteStory(c, id, user.id);
    return c.json(result, 200);
  } catch (error: unknown) {
    console.error(`Error deleting story ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
        return c.json({ error: errorMessage }, 404);
    }
    
    return c.json({ error: '物語の削除中にサーバーエラーが発生しました' }, 500);
  }
});

// 音声ファイルを削除する
posts.delete('/audios/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  if (Number.isNaN(id)) {
    return c.json({ error: 'IDの形式が正しくありません' }, 400);
  }

  try {
    const result = await deleteStoryAudio(c, id, user.id);
    return c.json(result, 200);
  } catch (error: unknown) {
    console.error(`Error deleting audio ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';

    if (errorMessage.includes('見つからないか') || errorMessage.includes('権限がありません')) {
      return c.json({ error: errorMessage }, 404);
    }

    return c.json({ error: '音声の削除中にサーバーエラーが発生しました' }, 500);
  }
});

export default posts;