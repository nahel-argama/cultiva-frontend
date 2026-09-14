const BRASIL_API_URL = 'https://brasilapi.com.br/api';

export async function fetchAddressByCep(cep) {
  const response = await fetch(`${BRASIL_API_URL}/cep/v2/${cep}`);
  if (!response.ok) throw new Error('CEP não encontrado.');
  return response.json();
}

export async function fetchStates() {
  const response = await fetch(`${BRASIL_API_URL}/ibge/uf/v1`);
  if (!response.ok) throw new Error('Não foi possível carregar os estados.');
  return response.json();
}
