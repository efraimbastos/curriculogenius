# Resume Builder Frontend

Este projeto é um construtor de currículos baseado na web, permitindo que os usuários criem e personalizem seus currículos de forma fácil e intuitiva.

## Estrutura do Projeto

O projeto é organizado da seguinte forma:

```
resume-builder-frontend
├── public
│   └── index.html          # Página HTML principal do aplicativo
├── src
│   ├── lib
│   │   └── supabaseClient.ts # Cliente Supabase para operações do lado do cliente
│   ├── components
│   │   └── index.ts        # Definição e exportação de componentes da interface do usuário
│   ├── styles
│   │   └── main.css        # Estilos CSS globais para a aplicação
│   └── main.ts             # Ponto de entrada da aplicação TypeScript
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Documentação do projeto
```

## Instalação

Para instalar e executar o projeto, siga os passos abaixo:

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```

2. Navegue até o diretório do projeto:
   ```
   cd resume-builder-frontend
   ```

3. Instale as dependências:
   ```
   npm install
   ```

## Uso

Para iniciar o aplicativo, execute o seguinte comando:

```
npm start
```

O aplicativo estará disponível em `http://localhost:3000`.

## Desenvolvimento

Para contribuir com o projeto, você pode:

- Criar novas funcionalidades
- Corrigir bugs
- Melhorar a documentação

Sinta-se à vontade para abrir pull requests ou issues para discutir melhorias.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).