import { create } from 'zustand';
import type { Story } from 'types/hono';
import { toast } from 'sonner';

interface StoryState {
  stories: Story[];
  isLoading: boolean;
  fetchStories: (token: string) => Promise<void>;
  updateStory: (updatedStory: Partial<Story> & { id: number }) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  isLoading: true,
  fetchStories: async (token: string) => {
    console.log('[storyStore] Fetching stories...');
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('認証の有効期限が切れました。再度ログインしてください。');
        } else {
          throw new Error('物語の取得に失敗しました。');
        }
        set({ stories: [] });
        return;
      }

      const data = await response.json() as { stories: Story[] };
      console.log('[storyStore] Stories fetched:', data.stories);
      set({ stories: data.stories || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました。';
      toast.error(errorMessage);
      set({ stories: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  updateStory: (updatedStory) => {
    console.log('[storyStore] Updating story:', updatedStory);
    set(state => ({
      stories: state.stories.map(story =>
        story.id === updatedStory.id ? { ...story, ...updatedStory } : story
      ),
    }));
    // Use get() to access the state after an update for logging
    console.log('[storyStore] Current stories state after update:', get().stories.map(s => ({ id: s.id, status: s.audio_status })));
  },
}));
