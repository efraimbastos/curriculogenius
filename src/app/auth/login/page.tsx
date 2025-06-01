// src/app/auth/login/page.tsx
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Entrar na sua Conta</h2>
        <AuthForm mode="login" />
        {/* TODO: Add Social Login Buttons here */}
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{" "}
          <a href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}

