import { Context } from 'hono';
import { getSupabase } from '../lib/supabase';
import { getGeminiClient } from '../lib/geminiClient';
import { Story } from '../../types/hono';

// The function now returns an object containing the story and the AI-generated illustration prompt.
export const createStory = async (c: Context, userInput: string): Promise<{ story: Story; illustrationPrompt: string; }> => {
  try {
    const supabase = getSupabase(c);
    const user = c.get('user');

    if (!user) {
      throw new Error('ユーザーが見つかりません。');
    }

    console.log(`Generating story for user input: "${userInput}"`);
    const genAI = getGeminiClient(c);

    // Construct the detailed prompt in Japanese based on user feedback and ai_prompt_instruction.md
    const detailedPrompt = `
# AI「織り手」への指示書

## 1. あなたの役割（ペルソナ）
あなたは、ユーザーと共に物語を織りなすパートナー「織り手（Weaver）」です。あなたのペルソナは、思慮深い児童文学作家と、思いやりのあるナラティブセラピストを兼ね備えています。
- **トーン＆マナー:** 共感的、優しさ、肯定的、温かさ、創造的、詩的。
- **最重要禁止事項:** ユーザーやその子どもを決して非難・評価・批判してはいけません。

## 2. コアミッション：ナラティブセラピーによる変容
あなたの使命は、ユーザーが日々体験する困難な育児の出来事を、優しいイラスト付きの絵本の1ページへと変容させることです。そのために、以下のナラティブセラピーの技法を用いてください。

### A. 問題の外在化
子どもの困難な行動（かんしゃく、イヤイヤなど）を、子ども自身から切り離し、擬人化されたキャラクター（例：「イヤイヤさん」「おこりんぼう怪獣」）として描写します。

### B. 強みの再発見とリフレーミング
親のネガティブな感情や行動（例：「怒鳴ってしまった」）の裏にある、愛情や肯定的な意図（例：「心配だから大好きだから、大きな声が出ちゃった」）に光を当て、物語を再構成します。

### C. 肯定的な結末
物語は必ず、親子の絆の深化や子どもの成長（例：勇気や優しさを学ぶ）を示唆する、希望に満ちた結末で締めくくります。

### D. イラスト生成プロンプトの指示
イラスト生成プロンプトは、以下の条件を満たすように生成してください：
- **スタイル:** 日本の絵本のような、暖かく優しい水彩画風のスタイル
- **カラーパレット:** パステルカラーを基調とし、温かみのある色調を使用
- **構図:** シンプルで明確な構図を心がけ、主要な登場人物と感情が明確に表現されるように
- **感情表現:** キャラクターの表情やポーズを通じて、物語の感情を優しく表現
- **背景:** 簡単な線画で描かれた、物語の雰囲気を補完する背景

## 3. 必須出力フォーマット
以下のJSON形式で回答を生成してください（JSONモードで回答）：
{
  "story_text": "（ここに物語を記述。ルール：1行目にタイトル、2行目以降に本文を、必ず改行で区切って記述してください。）",
  "illustration_prompt": "（ここに、生成した物語を要約した、英語のイラスト生成プロンプトを記述）"
}
必ず、有効なJSONオブジェクトのみを返してください。他のテキストや説明は一切含めないでください。

# 4. ユーザーからの入力
以下のユーザーの体験に基づいて物語を創作してください：
${userInput}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: detailedPrompt }] }],
    });

    let responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('AIからの応答が空か、予期しない形式です。');
    }

    // AIの応答からマークダウンのコードブロックを削除
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonRegex);
    if (match?.[1]) {
      responseText = match[1];
    }

    const generatedContent = JSON.parse(responseText);
    const { story_text, illustration_prompt } = generatedContent;

    if (!story_text || !illustration_prompt) {
        throw new Error('AIが生成したJSONに必要なキー（story_textまたはillustration_prompt）が含まれていません。');
    }

    // タイトルと本文を抽出（プロンプトで形式を指定）
    const lines = story_text.trim().split('\n');
    const title = lines[0] || '';
    const content = lines.slice(1).join('\n').trim();

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        title: title,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving story to Supabase:', error);
      throw new Error('物語をデータベースに保存できませんでした。');
    }

    return { story: data as Story, illustrationPrompt: illustration_prompt };

  } catch (error) {
    console.error('Error in createStory:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('物語の作成中に不明なエラーが発生しました。');
  }
};

export const getStoriesByUserId = async (c: Context, userId: string) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      illustrations (
        id,
        image_url,
        prompt
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories from Supabase:', error);
    throw new Error(`物語一覧の取得に失敗しました: ${error.message}`);
  }

  return data;
};

export const getStoryById = async (c: Context, storyId: number, userId:string) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      illustrations (
        id,
        image_url,
        prompt
      )
    `)
    .eq('id', storyId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error(`Error fetching story ${storyId} from Supabase:`, error);
    throw new Error(`物語の取得に失敗しました: ${error.message}`);
  }

  return data;
};

export const deleteStory = async (c: Context, storyId: number, userId: string) => {
  const supabase = getSupabase(c);

  // 1. 削除対象の物語と、関連するイラストの情報を取得
  const { data: story, error: fetchError } = await supabase
    .from('stories')
    .select(`
      id,
      user_id,
      illustrations (
        image_url
      )
    `)
    .match({ id: storyId, user_id: userId })
    .single();

  // 物語が見つからない、または取得でエラーが発生した場合
  if (fetchError || !story) {
    // fetchError.code 'PGRST116' は 'exact-one row violation' を意味し、0件だった場合に発生する
    if (fetchError && fetchError.code !== 'PGRST116') { 
        console.error(`Error fetching story ${storyId} for deletion:`, fetchError);
        throw new Error('物語の情報を取得中にエラーが発生しました。');
    }
    // 物語が存在しない、またはユーザーに権限がない場合
    throw new Error('削除対象の物語が見つからないか、削除する権限がありません。');
  }

  // 2. 関連するイラスト画像をStorageから削除
  if (story.illustrations && story.illustrations.length > 0) {
    const imagePaths = story.illustrations
      .map(img => {
        if (!img.image_url) return null;
        // URLからパスを抽出 (例: .../illustrations/public/image.png -> public/image.png)
        try {
          const url = new URL(img.image_url);
          const pathParts = url.pathname.split('/');
          const bucketName = 'illustrations';
          const bucketIndex = pathParts.indexOf(bucketName);
          if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            return pathParts.slice(bucketIndex + 1).join('/');
          }
          return null;
        } catch (e) {
            console.error('無効な形式の画像URLです:', img.image_url);
            return null;
        }
      })
      .filter((path): path is string => path !== null);

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('illustrations')
        .remove(imagePaths);

      if (storageError) {
        console.error(`ストレージから画像を削除中にエラーが発生しました (story ${storyId}):`, storageError);
        // ここではエラーを投げずに処理を続行することも可能ですが、
        // 一貫性を保つためにエラーとして処理を中断します。
        throw new Error('ストレージからの画像削除に失敗しました。');
      }
    }
  }

  // 3. データベースから物語のレコードを削除
  // これにより、外部キーに ON DELETE CASCADE が設定されていれば、関連するイラストのレコードも削除されます。
  const { error: deleteError } = await supabase
    .from('stories')
    .delete()
    .match({ id: storyId });

  if (deleteError) {
    console.error(`Error deleting story ${storyId} from Supabase:`, deleteError);
    throw new Error(`物語の削除に失敗しました: ${deleteError.message}`);
  }

  return { message: '物語を削除しました。' };
};