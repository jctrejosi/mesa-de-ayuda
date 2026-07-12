import api from "./api";

export interface Branch {
  id: number;
  name: string;
  address: string | null;
}

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export const companyService = {
  async getBranches(): Promise<Branch[]> {
    const response = await api.get("/company/branches");
    return response.data.data || response.data;
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get("/company/departments");
    return response.data.data || response.data;
  },

  async getPositions(): Promise<Position[]> {
    const response = await api.get("/company/positions");
    return response.data.data || response.data;
  },
};
