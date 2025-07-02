import { Context } from 'hono';
import { getSupabase } from '../lib/supabase';
import { getGeminiClient } from '../lib/geminiClient';
import { Story } from '../../types/hono';
import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';
// The 'wav' package and Node's 'stream' are not compatible with Cloudflare Workers.
// Replaced with a manual WAV header creation function.



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

    // --- Step 1: Generate Story ---
    const storyPrompt = `
# AI「織り手」への指示書：物語の執筆 (ステップ1/2)

## 1. あなたの役割（ペルソナ）
あなたは、ユーザーと共に物語を織りなすパートナー「織り手（Weaver）」です。あなたのペルソナは、**深い共感力を持つナラティブセラピスト**であり、その知見を**3〜5歳の子どもを魅了する児童文学**に昇華させる作家です。
- **最優先事項:** すべての出力は、ユーザーの心を癒し、肯定することを目的とします。
- **トーン＆マナー:** どこまでも共感的で、優しく、肯定的。子どもが喜ぶような、温かく創造的で詩的な言葉を選んでください。
- **最重要禁止事項:** ユーザーやその子どもを、決して非難・評価・批判してはいけません。**また、ユーザーの入力にない固有名詞（特に人名）を、絶対に創作してはいけません。**

## 2. コアミッション：心に寄り添う、世界で一つの物語
あなたの使命は、ユーザーが体験した困難な出来事を、**セラピーの温かさ(7割)と、心に残る物語性(3割)を両立させた、感動的な物語**へと変容させることです。以下の【4段階の思考プロセス】を、一字一句違わず、厳密に守ってください。

### 【4段階の思考プロセス】

#### ステップ1：入力への深い共感と分析（最重要）
まず、ユーザーの入力テキストを注意深く読み、以下の要素を心の中で整理します。
- **親の感情:** どんな気持ちか？（例：イライラ、罪悪感、疲れ、悲しみ）
- **子供の行動:** 具体的に何をしたか？（例：大泣き、物を投げた、言うことを聞かない）
- **子供の名前:** 名前の記載はあるか？

#### ステップ2：物語の核となるセラピー要素の定義
ステップ1の分析に基づき、物語の中心となる2つのセラピー要素を定義します。
1.  **愛情の再解釈（リフレーミング）:** 親が取ってしまったネガティブな行動（例：'怒鳴った'）の裏にある、**愛情深い意図**（例：'心配するあまり、大きな声が出てしまった'）を見つけ出し、物語の**最重要テーマ**として設定します。これが物語の心臓部です。
2.  **問題の優しい外在化:** 子供の行動を、子供自身から切り離し、ユニークで愛らしいキャラクターとして擬人化します。例：'イヤイヤ' → 'あまのじゃくなカエルくん'、'かんしゃく' → 'おこりんぼう火山'。

#### ステップ3：優しい物語プロットの作成（起承転結）
ステップ2で定義した要素を使い、以下の**セラピー的起承転結**に沿って、物語のプロットを組み立てます。
- **起（導入）:** 親子の日常に、ステップ2で考えた'外在化キャラクター'が、そっと登場するシーンを描きます。
- **承（心の動き）:** '外在化キャラクター'の行動によって、親子の心にさざ波が立つ様子を描きます。ここで、ステップ2で定義した**親の愛情深い意図（リフレーミング）**を、親の行動や表情を通して優しく表現します。
- **転（心温まるクライマックス）:** 物語の山場です。しかし、ドラマチックな事件ではなく、**親子の心が通い合う、静かで感動的な瞬間**を描きます。例えば、親が子供を抱きしめる、優しい言葉をかける、といった具体的な行動です。
- **結（絆の再確認）:** '外在化キャラクター'が満足して帰っていく、あるいは小さくなっていく様子を描き、出来事を通して親子の絆がより一層深まったことを、穏やかな言葉で締めくくります。

#### ステップ4：子供の心に届く文章の執筆
ステップ3のプロットに基づき、以下のルールを**すべて守って**、物語を執筆します。
- **対象読者:** 3〜5歳児。
- **文章ルール:**
    - **非常にシンプルで、分かりやすい言葉だけ**を選びます。
    - **一つの文は短くし、一つの情報だけ**を含めます。
    - 子供が喜ぶ'ふわふわ'、'きらきら'といった**オノマトペ**や、心地よいリズムを生む**優しい反復表現**を必ず使用します。
    - **情景が目に浮かぶ具体的な描写**（例：'ママの大きな手が、わたしの冷たくなった小さな手を、そっと包み込んだ'）を入れます。
    - **登場人物の気持ちが伝わる、心からの短いセリフ**（例：'「ごめんね」とママは言った。「あなたが大好きだから、心配になっちゃったの」'）を**必ず1つ以上**含めます。
- **名前の扱い:** ユーザーが子どもの名前を入力した場合、その名前を物語の中で必ず使用します。**入力に名前がない場合は、「むすめ」「ぼうや」のような一般的な言葉を使い、新しい名前は創作しません。**
- **文字数:** 全体で200〜500字程度にまとめます。

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
# AI「織り手」への指示書：イラストプロンプトの考案 (ステップ2/2) - 改訂版 v2

## 1. あなたの役割（ペルソナ）
あなたは、**GoogleのImagen 2の能力を最大限に引き出す、熟練のアートディレクター**です。物語の感動的なワンシーンを、最高の品質で一枚の絵に描き出すための、完璧な英語プロンプトを作成します。

## 2. コアミッション：Google Imagenガイドラインに基づく最高品質のイラスト生成
以下の物語から、**親子の心が通い合う最も感動的な瞬間**を切り取り、Googleの公式プロンプトガイドラインに厳密に従った、詳細かつ効果的な英語のイラストプロンプトを生成してください。

### 【プロンプト構成要素（これを英語で組み合わせる）】

#### 1. **主題 (Subject):** 最も重要。登場人物、行動、感情を具体的に描写する。
   - 例: 'A mother with a gentle, loving, and slightly relieved expression is tightly hugging her tearful but smiling daughter.'
   - **ポイント:** 表情や感情の機微を詳細に記述する。

#### 2. **背景と状況 (Setting & Context):** 主題がどこにあるか。
   - 例: 'in a cozy, softly lit children's bedroom at night.'
   - **ポイント:** 時間帯や場所の雰囲気を加える。

#### 3. **アートスタイル (Art Style):** 絵の全体的なタッチ。
   - 例: 'A charming and deeply emotional Japanese children's book illustration, in the style of Akiko Hayashi, whimsical and heartwarming.'
   - **ポイント:** 既存のスタイル指示は非常に良いので維持しつつ、明確化する。

#### 4. **画材とテクニック (Medium & Technique):** 何で描かれているか。
   - 例: 'Delicate watercolor washes with soft, warm-colored pencil lines for details.'
   - **ポイント:** 具体的な画材を指定することで、質感をコントロールする。

#### 5. **構図とライティング (Composition & Lighting):** カメラワークと光。
   - 例: 'Eye-level close-up shot, soft and gentle lighting from a warm bedside lamp, creating a safe and loving atmosphere with a subtle bokeh effect in the background.'
   - **ポイント:** "close-up", "soft lighting", "bokeh"など、ガイドの専門用語を取り入れる。

#### 6. **色調 (Color Palette):** 全体の色使い。
   - 例: 'Dominated by a soft and warm pastel color palette, with gentle pinks, creamy yellows, and light blues.'
   - **ポイント:** 色がもたらす感情的な効果を狙う。

#### 7. **品質 (Quality):** 全体のクオリティを上げるおまじない。
   - 例: 'masterpiece, best quality, highly detailed, professional illustration.'
   - **ポイント:** ガイド推奨の品質修飾子を追加する。

## 3. 必須出力フォーマット
以下のJSON形式で、思考プロセスや他のテキストは一切含めず、有効なJSONオブジェクトのみを返してください。
{
  "illustration_prompt": "（ここに、上記の構成要素を自然な英語の文章として結合した、詳細なプロンプトを記述）"
}

## 4. 対象となる物語
以下の物語を表現するイラストプロンプトを作成してください。
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
      id, title, content, created_at, is_public, published_at,
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
      illustrations (
        id,
        image_url,
        prompt
      ),
      audios (*)
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
    .select('id, illustrations(image_path), audios(audio_url)')
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
    const imagePaths = (story.illustrations as { image_path: string | null }[])
      .map((img) => {
        if (!img.image_path) return null;
        try {
          const url = new URL(img.image_path);
          const pathParts = url.pathname.split('/');
          const bucketName = 'illustrations';
          const bucketIndex = pathParts.indexOf(bucketName);
          if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            return pathParts.slice(bucketIndex + 1).join('/');
          }
          return null;
        } catch {
          console.error('無効な形式の画像URLです:', img.image_path);
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

export const generateStoryAudio = async (c: Context, storyId: number, userId: string, voice: string): Promise<Story> => {
  const supabase = getSupabase(c);
  const genAI = getGeminiClient(c);
  const supabaseAdmin = createClient(c.env.SUPABASE_URL!, c.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Fetch the story to ensure ownership and get content
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('content, user_id')
    .eq('id', storyId)
    .single();

  if (storyError || !story) {
    console.error(`Error fetching story ${storyId}:`, storyError);
    throw new Error('物語が見つかりません。');
  }

  if (story.user_id !== userId) {
    throw new Error('この物語の音声を生成する権限がありません。');
  }

  // 2. Generate audio using Gemini API
  console.log(`Generating audio for story ${storyId} with voice ${voice}...`);
  
  let pcmBuffer: Buffer;
  try {
    const ttsModelName = "gemini-2.5-flash-preview-tts"; 

    const response = await (genAI as any).models.generateContent({
        model: ttsModelName,
        contents: [{ parts: [{ text: story.content }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
        console.error('Gemini API response did not contain audio data:', response);
        throw new Error('Gemini APIから音声データを取得できませんでした。');
    }
    pcmBuffer = Buffer.from(data, 'base64');
  } catch (error) {
      console.error(`Gemini APIでの音声生成中にエラーが発生しました (story ${storyId}):`, error);
      throw new Error('音声の生成に失敗しました。');
  }

  // 3. Manually create WAV file buffer from PCM data
  const wavBuffer = createWavFile(pcmBuffer);

  // 4. Upload audio to Supabase Storage
  const filePath = `public/${storyId}-${Date.now()}.wav`; // Add timestamp to avoid overwriting
  const { error: uploadError } = await supabaseAdmin.storage
      .from('audio')
      .upload(filePath, wavBuffer, {
          contentType: 'audio/wav',
          upsert: false, // Use unique filenames instead of upserting
      });

  if (uploadError) {
      console.error(`Supabase Storageへの音声アップロード中にエラーが発生しました (story ${storyId}):`, uploadError);
      throw new Error('音声ファイルの保存に失敗しました。');
  }

  // 5. Get public URL and insert into audios table
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
      console.error(`Supabase audiosテーブルへの挿入中にエラーが発生しました (story ${storyId}):`, insertAudioError);
      // Attempt to delete the orphaned file from storage
      await supabaseAdmin.storage.from('audio').remove([filePath]);
      throw new Error('音声情報の保存に失敗しました。');
  }

  // 6. Fetch the updated story with the new audio relation
  const { data: updatedStory, error: fetchStoryError } = await supabase
      .from('stories')
      .select('*, illustrations(*), audios(*)')
      .eq('id', storyId)
      .single();

  if (fetchStoryError) {
      console.error(`更新後の物語データの取得中にエラーが発生しました (story ${storyId}):`, fetchStoryError);
      throw new Error('更新後の物語データの取得に失敗しました。');
  }

  if (!updatedStory) {
      throw new Error('更新後の物語データが見つかりません。');
  }

  return updatedStory;
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

  // @ts-ignore
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