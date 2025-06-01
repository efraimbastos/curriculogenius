// src/app/auth/signup/page.tsx
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Criar sua Conta</h2>
        <AuthForm mode="signup" />
        {/* TODO: Add Social Login Buttons here */}
        <p className="text-sm text-center text-gray-600">
          Já tem uma conta?{" "}
          <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}

