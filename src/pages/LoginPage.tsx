"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { loginUser } from "@/services/authService"
import { useAuthStore } from "@/stores/authStore"
import { useEffect } from "react"
import { toast } from "sonner"
import type { Session } from "@supabase/supabase-js"

const formSchema = z.object({
  email: z.string().email({
    message: "無効なメールアドレスです。",
  }),
  password: z.string().min(1, {
    message: "パスワードは必須です。",
  }),
})

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/stories', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await loginUser(values) as { session: Session | null };
      if (data.session) {
        setSession(data.session);
        navigate('/stories');
      } else {
        toast.error("ログインに失敗しました：セッションが受信されませんでした。");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] mx-auto px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg border border-stone-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">ログイン</h1>
          <p className="text-stone-500">アカウントにアクセスするために認証情報を入力してください。</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              placeholder="メールアドレスを入力"
              {...form.register("email")}
              className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
            {form.formState.errors.email && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              {...form.register("password")}
              className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
            {form.formState.errors.password && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage;