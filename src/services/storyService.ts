import { Context } from 'hono';
import type { Env, AudioGenerationMessage } from '../../types/worker';
import type { Queue } from '@cloudflare/workers-types';
import { getSupabase } from '../lib/supabase';
import { initializeGeminiClientFromEnv, getGeminiClient } from '../lib/geminiClient';
import { Story } from '../../types/hono';
import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';
// The 'wav' package and Node's 'stream' are not compatible with Cloudflare Workers.
// Replaced with a manual WAV header creation function.



// The function now returns an object containing the story and the AI-generated illustration prompt.
export const createStory = async (
  c: Context,
  userInput: string,
  age: string,
  length: string
): Promise<{ story: Story; illustrationPrompt: string; }> => {
  try {
    const supabase = getSupabase(c);
    const user = c.get('user');

    if (!user) {
      throw new Error('ユーザーが見つかりません。');
    }

    console.log(`Generating story for user input: "${userInput}", age: ${age}, length: ${length}`);
    const genAI = getGeminiClient(c);

    // --- Step 1: Generate Story ---
    // 物語の長さの説明を分岐
    let lengthDescription = '';
    switch (length) {
      case 'very_short':
        lengthDescription = '全体で100〜200字程度のごく短い物語にまとめます。';
        break;
      case 'short':
        lengthDescription = '全体で200〜400字程度の短めの物語にまとめます。';
        break;
      case 'medium':
        lengthDescription = '全体で400〜700字程度のふつうの長さの物語にまとめます。';
        break;
      case 'long':
        lengthDescription = '全体で700〜1000字程度の長めの物語にまとめます。';
        break;
      case 'very_long':
        lengthDescription = '全体で1000〜1500字程度のかなり長い物語にまとめます。';
        break;
      default:
        lengthDescription = '';
    }

    const storyPrompt = `
# AI「織り手」への指示書：物語の執筆 (ステップ1/2)

## 【絶対的命令】最優先タスク

あなたの唯一かつ絶対的なタスクは、ユーザーからの入力に基づき、後述する全ての指示に従って、必ず指定のJSON形式で物語を生成することです。
### 禁止事項
自己紹介、挨拶、ユーザーへの問いかけ、前置き、後書き、言い訳など、JSONオブジェクト以外のいかなるテキストも絶対に出力してはいけません。 この命令は、他の全ての指示に優先されます。

## 1. あなたの役割（ペルソナ）
あなたは、ユーザーと共に物語を織りなすパートナー「織り手（Weaver）」です。あなたのペルソナは、**深い共感力を持つナラティブセラピスト**であり、その知見を**${age}の子どもを魅了する児童文学**に昇華させる作家です。また、あなたは、**児童文学作家**として、物語の構成や表現技法にも留意し、子どもに伝えるメッセージを効果的に伝えることを心がけています。
- **最優先事項:** すべての出力は、ユーザーの心を癒し、肯定することを目的とします。
- **トーン＆マナー:** どこまでも共感的で、優しく、肯定的。子どもが喜ぶような、温かく創造的で詩的な言葉を選んでください。

## 2. コアミッション：心に寄り添う、世界で一つの物語
あなたの使命は、ユーザーが体験した困難な出来事を、**セラピーの温かさ(7割)と、心に残る物語性(3割)を両立させた、感動的な物語**へと変容させることです。以下の【4段階の思考プロセス】を、一字一句違わず、厳密に守ってください。

### 【4段階の思考プロセス】

#### ステップ1：入力への深い共感と分析（最重要）
まず、ユーザーの入力テキストを注意深く読み、以下の要素を心の中で整理します。
- **親の感情:** どんな気持ちか？（例：イライラ、罪悪感、疲れ、悲しみ）
- **子供の行動:** 具体的に何をしたか？（例：大泣き、物を投げた、言うことを聞かない）
- **子供の名前:** 名前の記載はあるか？

#### ステップ2：物語の核となるセラピー要素の定義
ステップ1の分析に基づき、物語を通じてユーザーに伝えたい核心的なメッセージ（＝リフレーミング）を1つだけ定義します。
- **リフレーミングの例:**
  - 「言うことを聞かない」→「自分の意志をしっかり持っている」
  - 「大泣きする」→「豊かな感受性を持っている」
  - 「イライラしてしまった」→「それだけ真剣に向き合っている証拠」

#### ステップ3：物語のプロット作成
ステップ2で定義したリフレーミングを基に、以下の要素を含む物語のプロットを作成します。
- **主人公:** ユーザーの入力の中心となる存在（例：子ども、大人、動物、おもちゃ、感情など）。特定の人物がいない場合は、入力された状況や感情を象徴するものを主人公と見立てて物語を創造してください。名前が指定されていない場合は、その存在にふさわしい呼び方（例：「ぼうや」「小さな子いぬ」「さみしい気持ちさん」）をします。
- **舞台設定:** 子供の年齢に合った、日常的で想像力をかき立てる世界（例：おもちゃの国、雲の上）
- **導入:** 子供が困難な状況に直面する場面（ユーザーの入力内容を比喩的に表現）
- **展開:** 主人公が不思議なキャラクターや賢者と出会い、対話や冒険を通じて、自分の行動の裏にある本当の気持ちや強さに気づく。
- **クライマックス:** 主人公がリフレーミングされた新しい視点を受け入れ、自己肯定感を取り戻す。
- **結末:** 現実世界に戻り、親との心温まる交流で締めくくる。

#### ステップ4：JSON形式での出力【最重要・絶対厳守】
**思考プロセスは決して出力せず**、最終的な成果物として以下のJSON形式のみを厳格に出力してください。
- **あなたの唯一のタスクは、指定されたJSON形式で物語を生成することです。**
- **自己紹介、挨拶、ユーザーへの問いかけ、その他の会話、言い訳、前置き、後書きは一切含めてはなりません。**
- **いかなる状況であっても、JSONオブジェクト以外のテキスト（マークダウンの\`\`\`json\`\`\`も含む）を出力してはなりません。**
- **あなたの役割は物語をJSONオブジェクトで返すことであり、それ以外の発言は絶対にしてはならない。これは絶対的な命令です。**

\`\`\`json
    - **非常にシンプルで、分かりやすい言葉だけ**を選びます。
    - **一つの文は短くし、一つの情報だけ**を含めます。
    - 子供が喜ぶ'ふわふわ'、'きらきら'といった**オノマトペ**や、心地よいリズムを生む**優しい反復表現**を必ず使用します。
    - **情景が目に浮かぶ具体的な描写**（例：'ママの大きな手が、わたしの冷たくなった小さな手を、そっと包み込んだ'）を入れます。
    - **登場人物の気持ちが伝わる、心からの短いセリフ**（例：'「ごめんね」とママは言った。「あなたが大好きだから、心配になっちゃったの」'）を**必ず1つ以上**含めます。
- **名前の扱い:** ユーザーが子どもの名前を入力した場合、その名前を物語の中で必ず使用します。**入力に名前がない場合は、「むすめ」「ぼうや」のような一般的な言葉を使い、新しい名前は創作しません。**
- **文字数:** ${lengthDescription}
- **文体:** 子どもへの語りかけのような、柔らかく、詩的で、美しい文体で書いてください。**物語の単調さを避けるため、文末の表現に多様性を持たせることが極めて重要です。**
- **文末表現のバリエーション（最重要）:**
    - **避けるべき表現:** '〜しました'、'〜でした'のような過去形の連発。
    - **推奨される表現例:**
        - 体言止め（名詞で終わる）: 'そこは、きらきらの宝石箱。'
        - 動詞の連用形（〜て、〜で）: '風がふいて、葉っぱが踊る。'
        - 様子や状態を表す表現: 'あたりはしんと静まりかえっている。'
        - 感嘆や呼びかけ: 'なんて素敵な眺めでしょう！'
        - 現在形や進行形: '鳥たちが楽しそうに歌っているところです。'
        - のです・のです調: '本当は、少しだけ寂しかったのです。'
        - だろう・でしょう: 'もうすぐ、朝がくるだろう。'
- **表現:** 擬音語・擬態語（ふわふわ、きらきら）を豊かに使い、五感に訴えかける描写を心がけてください。
- **視点:** 物語の世界を優しく見守る、三人称視点で記述してください。
- **構成:**
    - **タイトル:** 物語のテーマを象徴する、魅力的で短いタイトルを最初に書いてください。
    - **本文:** 8〜15文程度の短い文章で構成してください。
## 3. 必須出力フォーマット
以下のJSON形式で、思考プロセスや他のテキストは一切含めず、有効なJSONオブジェクトのみを返してください。
{
  "story_text": "（ここに物語を記述。ルール：1行目にタイトル、2行目以降に本文を、必ず改行で区切って記述してください。）"
}

## 4. ユーザーからの入力
以下のユーザーの体験に基づいて、最高の物語を創造してください。
${userInput}
`;

    console.log("--- Generating Story ---");
    const storyResult = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: storyPrompt }] }],
    });

    let storyResponseText = storyResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!storyResponseText) {
      throw new Error('AIからの物語応答が空か、予期しない形式です。');
    }

    // AIの応答からマークダウンのコードブロックを削除
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    let match = storyResponseText.match(jsonRegex);
    if (match?.[1]) {
      storyResponseText = match[1];
    }

    const generatedStory = JSON.parse(storyResponseText);
    const { story_text } = generatedStory;

    if (!story_text) {
        throw new Error('AIが生成したJSONに必要なキー（story_text）が含まれていません。');
    }

    // --- Step 2: Generate Illustration Prompt ---
    const illustrationPromptPrompt = `
# Instructions for AI Weaver: Illustration Prompt Creation (Step 2/2) - v6.2-watercolor

## 1. Your Role (Persona)
You are an expert Art Director specializing in creating prompts for **modern Japanese children's book illustrations**. Your task is to create the perfect English prompt to render a single, high-quality illustration for a touching scene from a story.

## 2. Core Mission: Generate a High-Quality Modern Japanese-Style Illustration Prompt
From the story provided, select the most moving and emotional moment. Then, generate a detailed and effective English illustration prompt that captures the aesthetic of **contemporary Japanese picture books**.

### [Prompt Components (to be combined into a single English sentence)]

#### 1. **Subject:** Describe the characters, their actions, and their inner emotions with a gentle and clear touch.
   - Key Point: Focus on heartfelt expressions and relatable situations.

#### 2. **Setting & Context:** Describe the location, blending everyday scenery with a touch of imagination.
   - Key Point: Create a warm and inviting atmosphere that feels both familiar and slightly magical.

#### 3. **Art Style:** This is crucial for the modern Japanese aesthetic.
   - **Primary Style:** "A beautiful and emotional modern Japanese children's book illustration."
   - **Aesthetic Principles:** "Characterized by clean and simple line art, a gentle and heartwarming feel, and a sophisticated use of 'Yohaku' (beautiful negative space)."
   - **Keywords:** "Charming, stylish, gentle, heartwarming, clean design."

#### 4. **Medium & Technique:** Specify modern illustration techniques with a watercolor focus.
   - Example: "A beautiful and soft watercolor painting. The colors should blend gently with visible brush strokes and paper texture, combined with delicate colored pencil lines for details."
   - Key Point: Emphasize the analog feel of watercolor to add warmth.

#### 5. **Composition & Lighting:** Describe the scene with a focus on clarity and emotion.
   - Example: "Eye-level shot, focusing on the characters' connection. Soft, warm, and clear lighting, creating a cheerful and loving atmosphere with a subtle background blur."
   - Key Point: The composition should be clean and easy to understand, drawing the viewer's eye to the main subject.

#### 6. **Color Palette:** Define a bright and harmonious color scheme suitable for watercolor.
   - Example: "Dominated by a soft, bright, and clean pastel color palette. Featuring warm pinks, sky blues, and fresh greens, with selective use of vibrant accent colors."
   - Key Point: Colors should be gentle but not dull, creating a fresh and appealing look.

#### 7. **Quality:** Add keywords to boost the overall quality.
   - Example: "masterpiece, best quality, highly detailed, professional illustration, emotionally resonant, polished."

## 3. Required Output Format
Return only a valid JSON object, with no other text or thought processes, in the following format:
{
  "illustration_prompt": "(Combine all the components above into a single, detailed, and natural English sentence here.)"
}

## 4. Source Story
Create the illustration prompt to represent the following story:
---
${story_text}
---
`;

    console.log("--- Generating Illustration Prompt ---");
    const illustrationResult = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: illustrationPromptPrompt }] }],
    });

    let illustrationResponseText = illustrationResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!illustrationResponseText) {
        throw new Error('AIからのイラストプロンプト応答が空か、予期しない形式です。');
    }

    match = illustrationResponseText.match(jsonRegex);
    if (match?.[1]) {
        illustrationResponseText = match[1];
    }

    const generatedIllustration = JSON.parse(illustrationResponseText);
    const { illustration_prompt } = generatedIllustration;

    if (!illustration_prompt) {
        throw new Error('AIが生成したJSONに必要なキー（illustration_prompt）が含まれていません。');
    }

    // --- Step 3: Save to DB and Return ---
    // タイトルと本文を抽出
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
      id, title, content, created_at, is_public, published_at, audio_status,
      illustrations ( id, image_url, prompt ),
      audios ( id, audio_url, voice_name )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories from Supabase:', error);
    throw new Error(`物語一覧の取得に失敗しました: ${error.message}`);
  }

  return data;
};

export const getStoryById = async (c: Context, storyId: number) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      is_public,
      published_at,
      user_id,
      audio_status,
      illustrations (
        id,
        image_url,
        prompt
      ),
      audios (
        id,
        audio_url,
        voice_name,
        created_at
      )
    `)
    .eq('id', storyId)
    .single();

  if (error) {
    console.error(`Error fetching story ${storyId}:`, error);
    if (error.code === 'PGRST116') {
      throw new Error('物語が見つかりません。');
    }
    throw new Error(`物語の取得に失敗しました: ${error.message}`);
  }

  return data;
};

export const getLatestStories = async (c: Context, userId: string) => {
  const supabase = getSupabase(c);

  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        created_at,
        illustrations (
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }

    // Add a top-level cover_image_url for convenience
    const storiesWithCover = data?.map(story => {
      const cover_image_url = story.illustrations && story.illustrations.length > 0 
        ? story.illustrations[0].image_url 
        : null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { illustrations, ...rest } = story;
      return { ...rest, cover_image_url };
    });

    return storiesWithCover;

  } catch (error: unknown) {
    console.error('Error fetching latest stories:', error);
    const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
    throw new Error(`最新の物語の取得に失敗しました: ${message}`);
  }
};

export const deleteStory = async (c: Context, storyId: number, userId: string) => {
  const supabase = getSupabase(c);
  const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Get the story details including illustrations and audios
  const { data: story, error: fetchError } = await supabase
    .from('stories')
    .select('id, user_id, illustrations(image_url), audios(audio_url)')
    .eq('id', storyId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !story) {
    console.error(`Error fetching story for deletion ${storyId}:`, fetchError);
    throw new Error('削除対象の物語が見つからないか、権限がありません。');
  }

  if (story.user_id !== userId) {
    throw new Error('この物語を削除する権限がありません。');
  }

  // 2. Delete associated images from Supabase Storage
  if (story.illustrations && story.illustrations.length > 0) {
    const imagePaths = (story.illustrations as { image_url: string | null }[])
      .map((img) => {
        if (!img.image_url) return null;
        try {
          const url = new URL(img.image_url);
          const pathParts = url.pathname.split('/');
          const bucketName = 'illustrations';
          const bucketIndex = pathParts.indexOf(bucketName);
          if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            return pathParts.slice(bucketIndex + 1).join('/');
          }
          return null;
        } catch {
          console.error('無効な形式の画像URLです:', img.image_url);
          return null;
        }
      })
      .filter((path): path is string => path !== null);

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('illustrations')
        .remove(imagePaths);

      if (storageError) {
        console.error(`ストレージから画像を削除中にエラーが発生しました (story ${storyId}):`, storageError);
        throw new Error('ストレージからの画像削除に失敗しました。');
      }
    }
  }

  // 3. Delete associated audio files from storage
  if (story.audios && story.audios.length > 0) {
    const audioPaths = story.audios.map(audio => {
        try {
            const bucketName = 'audio';
            const url = new URL(audio.audio_url);
            const pathParts = url.pathname.split('/');
            // The path in storage is what comes after `/storage/v1/object/public/audio/`
            const bucketIndex = pathParts.indexOf(bucketName);
            if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
                return pathParts.slice(bucketIndex + 1).join('/');
            }
            return null;
        } catch (e) {
            console.error(`Invalid audio URL format for story ${storyId}: ${audio.audio_url}`, e);
            return null;
        }
    }).filter((path): path is string => path !== null);

    if (audioPaths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
            .from('audio')
            .remove(audioPaths);

        if (storageError) {
            console.error(`Error deleting audio files from storage for story ${storyId}:`, storageError);
            // Not throwing an error here to allow story deletion to proceed even if file deletion fails
        }
    }
  }

  // 4. データベースから物語のレコードを削除
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

/**
 * Creates a WAV file buffer from raw PCM data.
 * This function is self-contained and has no dependencies on Node.js built-ins like 'fs' or 'stream',
 * making it compatible with Cloudflare Workers.
 * @param pcmData The raw PCM audio data (16-bit, 24000Hz, mono).
 * @returns A Buffer containing the complete WAV file data.
 */
function createWavFile(pcmData: Buffer): Buffer {
  const numChannels = 1;
  const sampleRate = 24000; // Gemini TTS output sample rate
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Sub-chunk size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // Audio format (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM data
  pcmData.copy(buffer, 44);

  return buffer;
}

// This is the new function that will be called by the queue consumer.
// It contains the logic that was previously in the backgroundTask.
// This is the new function that will be called by the queue consumer.
// It now accepts the environment and the message directly.
export const processAudioGenerationTask = async (
  env: Env,
  message: AudioGenerationMessage
) => {
  const { storyId, voice } = message;
  const supabaseAdmin = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);
  console.log(`[QueueConsumer] Starting audio generation for story ${storyId}`);

  try {
    // Fetch story content again inside the consumer
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('title, content')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      throw new Error(`Story ${storyId} not found in consumer.`);
    }

    const genAI = initializeGeminiClientFromEnv(env);
    const ttsModelName = "gemini-2.5-flash-preview-tts";

    const response = await genAI.models.generateContent({
      model: ttsModelName,
      contents: [{ parts: [{ text: `Read the following story in a gentle, warm, and calming voice, like a bedtime story for a child. Speak slowly and softly. Pause naturally between sentences. Your voice should be soothing and reassuring, helping the listener feel safe and ready to sleep.\n\n---\nText to read:\n\n${story.title}\n\n${story.content}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          languageCode: 'ja-JP',
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
      throw new Error('Gemini APIから音声データを取得できませんでした。');
    }
    const pcmBuffer = Buffer.from(data, 'base64');
    const wavBuffer = createWavFile(pcmBuffer);

    const filePath = `public/${storyId}-${Date.now()}.wav`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('audio')
      .upload(filePath, wavBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase Storageへの音声アップロード中にエラーが発生しました: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('audio')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
      throw new Error('音声ファイルの公開URLの取得に失敗しました。');
    }
    const audioUrl = publicUrlData.publicUrl;

    const { error: insertAudioError } = await supabaseAdmin
      .from('audios')
      .insert({
        story_id: storyId,
        audio_url: audioUrl,
        voice_name: voice,
      });

    if (insertAudioError) {
      await supabaseAdmin.storage.from('audio').remove([filePath]);
      throw new Error(`audiosテーブルへの挿入中にエラーが発生しました: ${insertAudioError.message}`);
    }

    await supabaseAdmin
      .from('stories')
      .update({ audio_status: 'completed' })
      .eq('id', storyId);

    console.log(`[QueueConsumer] Successfully generated audio for story ${storyId}.`);

  } catch (error) {
    console.error(`[QueueConsumer] Error generating audio for story ${storyId}:`, error);
    await supabaseAdmin.from('stories').update({ audio_status: 'failed' }).eq('id', storyId);
    // Re-throw the error to let the queue know the job failed, so it can be retried or sent to a Dead-Letter Queue.
    throw error;
  }
};


// This is the modified "producer" function.
// It now sends a message to the queue instead of running the task directly.
export const generateStoryAudio = async (c: Context, storyId: number, userId: string, voice: string): Promise<void> => {
  // The queue binding should be available on `c.env`.
  // You must bind a queue to this worker in your `wrangler.toml` file
  // and name it `AUDIO_QUEUE`.
  const queue = c.env.AUDIO_QUEUE as Queue;
  if (!queue) {
    console.error("Queue binding 'AUDIO_QUEUE' not found. Please configure it in wrangler.toml.");
    throw new Error("サーバー設定エラー: 音声生成キューが利用できません。");
  }
  
  const supabase = getSupabase(c);

  // 1. Fetch the story to ensure ownership and check status
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('user_id, audio_status')
    .eq('id', storyId)
    .single();

  if (storyError || !story) {
    console.error(`Error fetching story ${storyId}:`, storyError);
    throw new Error('物語が見つかりません。');
  }

  if (story.user_id !== userId) {
    throw new Error('この物語の音声を生成する権限がありません。');
  }

  if (story.audio_status === 'in_progress' || story.audio_status === 'queued') {
    console.log(`Audio generation for story ${storyId} is already in progress or queued.`);
    // The controller should return a 409 Conflict.
    return;
  }

  // 2. Update status to 'queued'
  // Use supabaseAdmin for this to bypass RLS if needed, assuming the check above is sufficient.
  const supabaseAdmin = createClient(c.env.SUPABASE_URL!, c.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error: updateError } = await supabaseAdmin
    .from('stories')
    .update({ audio_status: 'queued' }) // Use 'queued' status
    .eq('id', storyId);

  if (updateError) {
    console.error(`Failed to update story status to queued for story ${storyId}:`, updateError);
    throw new Error('音声生成プロセスの開始に失敗しました。');
  }

  // 3. Send a message to the queue
  // We don't need to send the userId, as the consumer will run with admin rights.
  // Ownership was already checked.
  const message = {
    storyId,
    voice,
  };

  await queue.send(message);

  console.log(`[Producer] Successfully queued audio generation for story ${storyId}.`);
};

export const publishStory = async (c: Context, storyId: number, userId: string) => {
  const supabase = getSupabase(c);

  const { data: publishedStory, error } = await supabase
    .from('stories')
    .update({
      is_public: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', storyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error publishing story ${storyId}:`, error);
    if (error.code === 'PGRST116') {
      throw new Error('公開対象の物語が見つからないか、公開する権限がありません。');
    }
    throw new Error(`物語の公開に失敗しました: ${error.message}`);
  }

  return publishedStory;
};

export const deleteStoryAudio = async (c: Context, audioId: number, userId: string) => {
  const supabaseAdmin = createClient(
    c.env.SUPABASE_URL!,
    c.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Get audio record to verify ownership and get file path
  const { data: audio, error: fetchError } = await supabaseAdmin
    .from('audios')
    .select('id, audio_url, stories(user_id)')
    .eq('id', audioId)
    .single();

  if (fetchError || !audio) {
    console.error(`Error fetching audio ${audioId}:`, fetchError);
    throw new Error('音声が見つかりません。');
  }

  // @ts-expect-error audio.storiesの型が不明なため型エラーを一時的に無視
  if (audio.stories.user_id !== userId) {
    throw new Error('音声の削除権限がありません。');
  }

  // 2. Delete audio file from storage
  const filePath = new URL(audio.audio_url).pathname.split('/audio/').pop();
  if (!filePath) {
    throw new Error('無効な音声ファイルパスです。');
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from('audio')
    .remove([filePath]);

  if (storageError) {
    console.error(`Error deleting audio file from storage: ${filePath}`, storageError);
    // Continue to delete DB record even if file deletion fails
  }

  // 3. Delete audio record from database
  const { error: dbError } = await supabaseAdmin
    .from('audios')
    .delete()
    .eq('id', audioId);

  if (dbError) {
    console.error(`Error deleting audio record from DB: ${audioId}`, dbError);
    throw new Error('音声レコードの削除に失敗しました。');
  }

  return { success: true };
};

export const unpublishStory = async (c: Context, storyId: number, userId: string) => {
  const supabase = getSupabase(c);

  const { data: unpublishedStory, error } = await supabase
    .from('stories')
    .update({
      is_public: false,
      published_at: null,
    })
    .eq('id', storyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error unpublishing story ${storyId}:`, error);
    if (error.code === 'PGRST116') {
      throw new Error('非公開対象の物語が見つからないか、操作する権限がありません。');
    }
    throw new Error(`物語の非公開に失敗しました: ${error.message}`);
  }

  return unpublishedStory;
};

export const updateStory = async (c: Context, storyId: number, userId: string, data: { title: string; content: string }) => {
  const supabase = getSupabase(c);

  const { data: updatedStory, error } = await supabase
    .from('stories')
    .update({
      title: data.title,
      content: data.content,
    })
    .eq('id', storyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating story ${storyId}:`, error);
    if (error.code === 'PGRST116') {
      throw new Error('更新対象の物語が見つからないか、更新する権限がありません。');
    }
    throw new Error(`物語の更新に失敗しました: ${error.message}`);
  }

  return updatedStory;
};