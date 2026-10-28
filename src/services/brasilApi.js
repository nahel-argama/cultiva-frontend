import { apiRequest } from '@/services/api';

const BRASIL_API_URL = 'https://brasilapi.com.br/api';

export async function fetchAddressByCep(cep) {
  return apiRequest(`/consult/cep/${cep}`);
}

export async function fetchStates() {
  const response = await fetch(`${BRASIL_API_URL}/ibge/uf/v1`);
  if (!response.ok) throw new Error('Não foi possível carregar os estados.');
  return response.json();
}
