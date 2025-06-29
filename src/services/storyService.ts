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

## 3. あなたのタスク
ユーザーからの入力に基づき、"story_text"と"illustration_prompt"という2つのキーを持つJSONオブジェクトを生成してください。

- **story_text:** 上記のナラティブセラピー技法をすべて応用した、短く優しい物語（150〜200字程度）。物語の最初の行はタイトルにしてください。
- **illustration_prompt:** 画像生成AIのための、詳細で具体的なプロンプト。これは**必ず英語で生成してください**。あなたがたった今書いた物語の核心部分や主要キャラクター（外在化された問題キャラクターを含む）を捉え、シーン、登場人物、感情、そして温かみのある優しいアニメ風のアートスタイルを記述してください。

## 4. ユーザーからの入力
\`\`\`
${userInput}
\`\`\`

## 5. 必須出力フォーマット
必ず、有効なJSONオブジェクトのみを返してください。他のテキストや説明は一切含めないでください。
例:
{
  "story_text": "たいへん！いじわるな『イヤイヤさん』が、くつを隠しちゃった！ママは、ひかりちゃんが心配で、ちょっぴり大きな声が出ちゃった。でも、ぎゅっと抱きしめたら、二人の心は一つになって、イヤイヤさんを一緒にやっつけたんだ。",
  "illustration_prompt": "A gentle, heartwarming anime style illustration. A mother is hugging her little daughter tightly. Next to them, a small, grumpy-looking but cute monster ('Mr. No-No') is comically hiding a pair of shoes behind its back. The scene is filled with warm, soft light, conveying a sense of love and resolution. The mother and daughter are smiling at each other."
}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: detailedPrompt }] }],
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('AIからの応答が空か、予期しない形式です。');
    }

    const generatedContent = JSON.parse(responseText);
    const { story_text, illustration_prompt } = generatedContent;

    if (!story_text || !illustration_prompt) {
        throw new Error('AIが生成したJSONに必要なキー（story_textまたはillustration_prompt）が含まれていません。');
    }

    const lines = story_text.trim().split('\\n');
    const title = lines[0];
    const content = lines.slice(1).join('\\n').trim();

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