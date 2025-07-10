import { api } from '../api-client';

export interface TechStack {
  id: number;
  name: string;
  category: string;
}

export interface FetchTechStacksResponse {
  status: number;
  message: string;
  result: TechStack[];
}

export async function getTechStacks(): Promise<TechStack[]> {
  const response: FetchTechStacksResponse = await api.get('/tech-stack');
  return response.result;
} 