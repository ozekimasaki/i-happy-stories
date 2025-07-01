"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { signupUser } from "@/services/authService"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email({
    message: "無効なメールアドレスです。",
  }),
  password: z.string().min(8, {
    message: "パスワードは8文字以上である必要があります。",
  }),
})

const SignupPage = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit called with values:", values);
    try {
      console.log("Attempting to sign up...");
      await signupUser(values);
      console.log("Signup successful.");
      toast.success('サインアップが成功しました！ログインしてください。');
      navigate('/login');
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] mx-auto px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg border border-stone-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">アカウントを作成</h1>
          <p className="text-stone-500">新しいアカウントを作成するために詳細を入力してください。</p>
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
              placeholder="パスワードを作成"
              {...form.register("password")}
              className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
            {form.formState.errors.password && (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            アカウント作成
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage; 