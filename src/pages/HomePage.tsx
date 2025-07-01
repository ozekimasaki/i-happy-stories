import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';

interface LatestStory {
    id: number;
    title: string;
    cover_image_url: string | null;
    created_at: string;
}

const HomePage: React.FC = () => {
    const {isAuthenticated, user, session} = useAuthStore();
    const [latestStories, setLatestStories] = useState < LatestStory[] > ([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    useEffect(() => {
        const fetchLatestStories = async () => {
            if (!session) 
                return;
            

            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/v1/posts/latest', {
                    headers: {
                        'Authorization': `Bearer ${
                            session.access_token
                        }`
                    }
                });

                if (! response.ok) {
                    if (response.status === 401) {
                        console.error('Authorization failed, token might be expired.');
                        setError('認証の有効期限が切れた可能性があります。再度ログインしてください。');
                        return;
                    }
                    throw new Error('物語の取得に失敗しました');
                }

                const data = (await response.json())as {
                    stories : LatestStory[]
                };
                setLatestStories(data.stories || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchLatestStories();
        } else {
            setLatestStories([]);
            setError(null);
        }
    }, [isAuthenticated, session]);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 text-stone-800">物語Weaversへようこそ</h1>
                <p className="text-xl text-stone-500 mb-8">あなただけの物語を紡ぎましょう。</p>
                <div> {
                    isAuthenticated ? (
                        <div className="space-y-4">
                            <p className="text-lg text-stone-700">おかえりなさい, {
                                user ?. email
                            }さん!</p>
                                                                                    <Link to="/generate-story" className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded inline-block">新たな物語を紡ぐ</Link>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="bg-amber-600 text-white hover:bg-amber-700 py-2 px-4 rounded inline-block">ログイン</Link>
                            <Link to="/signup" className="border border-stone-600 text-stone-600 hover:bg-stone-100 py-2 px-4 rounded inline-block">新規登録</Link>
                        </div>
                    )
                } </div>
            </div>

            {
            isAuthenticated && (
                <div className="text-left">
                    <h2 className="text-3xl font-bold mb-8 text-stone-800">あなたの最新の物語</h2>
                    {
                    loading && <p className="text-stone-500 text-center">読み込み中...</p>
                }
                    {
                    error && <p className="text-red-500 text-center">エラー: {error}</p>
                }
                    {
                    !loading && !error && latestStories.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {
                            latestStories.map((story) => (
                                <Link to={
                                        `/stories/${
                                            story.id
                                        }`
                                    }
                                    key={
                                        story.id
                                    }
                                    className="block hover:no-underline group">
                                    <div className="h-full flex flex-col bg-white border border-stone-200 rounded-lg group-hover:border-amber-400 transition-colors duration-200 overflow-hidden">
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold truncate text-stone-800">
                                                {
                                                story.title
                                            }</h3>
                                        </div>
                                        <div className="px-4 pb-4 flex-grow">
                                            <div className="w-full h-48 bg-stone-200 flex items-center justify-center overflow-hidden rounded-md">
                                                {
                                                story.cover_image_url ? (
                                                    <img src={
                                                            story.cover_image_url
                                                        }
                                                        alt={
                                                            story.title
                                                        }
                                                        className="w-full h-full object-cover"/>
                                                ) : (
                                                    <span className="text-stone-400">画像がありません</span>
                                                )
                                            } </div>
                                        </div>
                                        <div className="p-4 pt-2 mt-auto border-t border-t-stone-200">
                                            <p className="text-xs text-stone-500">
                                                作成日時: {
                                                new Date(story.created_at).toLocaleString()
                                            } </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        } </div>
                    )
                }
                    {
                    !loading && !error && latestStories.length === 0 && (
                        <p className="text-stone-500 text-center">まだ物語がありません。</p>
                    )
                }
                    {
                    !loading && !error && latestStories.length > 0 && (
                        <div className="text-center mt-8">
                            <Link to="/stories" className="border border-stone-600 text-stone-600 hover:bg-stone-100 py-2 px-4 rounded inline-block">
                                もっと見る
                            </Link>
                        </div>
                    )
                } </div>
            )
        } </div>
    );
};

export default HomePage;
