import { useAuthStore } from '../stores/authStore';
import type { Story } from '../../types/hono';

const getAuthHeaders = () => {
  const { session } = useAuthStore.getState();
  if (!session?.access_token) {
    // ここではエラーを投げずに、呼び出し元で処理できるようにnullを返すか、あるいは空のオブジェクトを返す方が柔軟かもしれません。
    // しかし、認証が必須のエンドポイントではエラーを投げる方が安全です。
    throw new Error('認証トークンが見つかりません。再度ログインしてください。');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
};

export const getStory = async (storyId: number): Promise<Story> => {
  const { session } = useAuthStore.getState();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`/api/v1/posts/${storyId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData?.error || '物語の取得に失敗しました。');
  }

  const data = await response.json() as { story: Story };
  return data.story;
};

export const publishStory = async (storyId: number): Promise<Story> => {
  const headers = getAuthHeaders();
  const response = await fetch(`/api/v1/posts/${storyId}/publish`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData?.error || '物語の公開に失敗しました。');
  }

  const data = await response.json() as { story: Story };
  return data.story;
};

export const unpublishStory = async (storyId: number): Promise<Story> => {
  const headers = getAuthHeaders();
  const response = await fetch(`/api/v1/posts/${storyId}/unpublish`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData?.error || '物語の非公開に失敗しました。');
  }

  const data = await response.json() as { story: Story };
  return data.story;
};

export const deleteAudio = async (audioId: number): Promise<{ success: boolean }> => {
  const headers = getAuthHeaders();
  const response = await fetch(`/api/v1/posts/audios/${audioId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData?.error || '音声の削除に失敗しました。');
  }

  return response.json();
};

export const generateAudio = async (id: number, voice: string): Promise<{ message: string }> => {
  const headers = getAuthHeaders();
  const response = await fetch(`/api/v1/posts/${id}/generate-audio`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ voice }),
  });

  // APIからの応答の型を明示的に定義する
  const data: { message: string; error?: string } = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '音声の生成リクエストに失敗しました。');
  }

  return data;
};
