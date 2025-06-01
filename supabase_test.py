from dotenv import load_dotenv
import os
from supabase import create_client

# Carrega as variáveis do .env
load_dotenv()

def get_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    return create_client(url, key)

# Exemplo de uso
client = get_client()
# Troque "nome_da_tabela" pelo nome real da sua tabela no Supabase
data = client.table("usuarios").select("*").execute()
print(data)