// emergenciesApi.ts
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Substitua pela URL real da sua API

// Configuração do Axios com autenticação via Sanctum
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Necessário pro Sanctum
});

// Interface para Emergência
export interface Emergency {
  id: string;
  title: string;
  description: string;
  date: string;
  veterinarianId: string;
  clinicId?: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

// Funções para interagir com a API de Emergências
export const emergenciesApi = {
  // Listar todas as emergências
  listEmergencies: async (): Promise<Emergency[]> => {
    const response = await api.get<Emergency[]>('/emergencias');
    return response.data;
  },

  // Buscar emergência por ID
  getEmergencyById: async (id: string): Promise<Emergency> => {
    const response = await api.get<Emergency>(`/emergencias/${id}`);
    return response.data;
  },

  // Criar nova emergência
  createEmergency: async (emergency: Omit<Emergency, 'id'>): Promise<Emergency> => {
    const response = await api.post<Emergency>('/emergencias', emergency);
    return response.data;
  },

  // Atualizar emergência existente
  updateEmergency: async (id: string, updates: Partial<Omit<Emergency, 'id'>>): Promise<Emergency> => {
    const response = await api.put<Emergency>(`/emergencias/${id}`, updates);
    return response.data;
  },

  // Deletar emergência
  deleteEmergency: async (id: string): Promise<void> => {
    await api.delete(`/emergencias/${id}`);
  },
};
