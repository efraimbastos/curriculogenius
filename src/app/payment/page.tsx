// src/app/payment/page.tsx
"use client";

import Link from "next/link";

export default function PaymentPage() {
  // Placeholder content based on wireframe
  // In a real application, integrate with a payment provider like Stripe

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Desbloqueie todo o potencial!
          </h2>
          <p className="text-lg text-gray-600">
            Você utilizou sua exportação gratuita. Assine um plano para continuar criando e exportando currículos ilimitados com recursos premium.
          </p>
        </div>

        {/* Placeholder for Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Plan 1: Annual */}
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900">Plano Premium Anual</h3>
            <p className="mt-2 text-4xl font-bold text-gray-900">R$ XX,XX <span className="text-base font-medium text-gray-500">/ ano</span></p>
            <p className="mt-1 text-sm text-green-600 font-medium">Economize Y%</p>
            <ul className="mt-6 space-y-3 text-gray-600 text-sm flex-grow">
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Exportações de PDF Ilimitadas</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Todos os Modelos Premium</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Análise de Vaga com IA Avançada</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Histórico de Versões Estendido</li>
               <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Suporte Prioritário</li>
            </ul>
            <button className="mt-8 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Assinar Plano Anual
            </button>
          </div>

          {/* Plan 2: Monthly */}
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900">Plano Premium Mensal</h3>
            <p className="mt-2 text-4xl font-bold text-gray-900">R$ Y,YY <span className="text-base font-medium text-gray-500">/ mês</span></p>
             <p className="mt-1 text-sm text-gray-500 font-medium invisible">Placeholder</p> {/* Keep height consistent */}
            <ul className="mt-6 space-y-3 text-gray-600 text-sm flex-grow">
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Exportações de PDF Ilimitadas</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Todos os Modelos Premium</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Análise de Vaga com IA Avançada</li>
              <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Histórico de Versões Estendido</li>
               <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Suporte Prioritário</li>
            </ul>
            <button className="mt-8 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Assinar Plano Mensal
            </button>
          </div>
        </div>

        {/* Placeholder for Payment Gateway Integration */}
        <div className="text-center border-t pt-6 mt-8">
          <p className="text-sm text-gray-600 mb-4">A integração com o gateway de pagamento (ex: Stripe) seria adicionada aqui.</p>
          <Link href="/dashboard">
            <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Voltar ao Dashboard
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

