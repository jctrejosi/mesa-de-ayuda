import api from "./api";
import type { Company, Branch, Department, Position } from "../types";

export const companyService = {
  // ============================================================
  // COMPAÑÍAS
  // ============================================================

  async getCompanies(): Promise<Company[]> {
    const response = await api.get<Company[]>("/company/companies");
    return response.data;
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await api.get<Company>(`/company/companies/${id}`);
    return response.data;
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    const response = await api.post<Company>("/company/companies", data);
    return response.data;
  },

  async updateCompany(id: number, data: Partial<Company>): Promise<Company> {
    const response = await api.put<Company>(`/company/companies/${id}`, data);
    return response.data;
  },

  async deleteCompany(id: number): Promise<void> {
    await api.delete(`/company/companies/${id}`);
  },

  // ============================================================
  // SUCURSALES
  // ============================================================

  async getBranches(companyId?: number): Promise<Branch[]> {
    const params = companyId ? { companyId } : undefined;
    const response = await api.get<Branch[]>("/company/branches", { params });
    return response.data;
  },

  async getBranchById(id: number): Promise<Branch> {
    const response = await api.get<Branch>(`/company/branches/${id}`);
    return response.data;
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    const response = await api.post<Branch>("/company/branches", data);
    return response.data;
  },

  async updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
    const response = await api.put<Branch>(`/company/branches/${id}`, data);
    return response.data;
  },

  async deleteBranch(id: number): Promise<void> {
    await api.delete(`/company/branches/${id}`);
  },

  // ============================================================
  // DEPARTAMENTOS
  // ============================================================

  async getDepartments(companyId?: number): Promise<Department[]> {
    const params = companyId ? { companyId } : undefined;
    const response = await api.get<Department[]>("/company/departments", {
      params,
    });
    return response.data;
  },

  async getDepartmentById(id: number): Promise<Department> {
    const response = await api.get<Department>(`/company/departments/${id}`);
    return response.data;
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await api.post<Department>("/company/departments", data);
    return response.data;
  },

  async updateDepartment(
    id: number,
    data: Partial<Department>,
  ): Promise<Department> {
    const response = await api.put<Department>(
      `/company/departments/${id}`,
      data,
    );
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/company/departments/${id}`);
  },

  // ============================================================
  // CARGOS
  // ============================================================

  async getPositions(companyId?: number): Promise<Position[]> {
    const params = companyId ? { companyId } : undefined;
    const response = await api.get<Position[]>("/company/positions", {
      params,
    });
    return response.data;
  },

  async getPositionById(id: number): Promise<Position> {
    const response = await api.get<Position>(`/company/positions/${id}`);
    return response.data;
  },

  async createPosition(data: Partial<Position>): Promise<Position> {
    const response = await api.post<Position>("/company/positions", data);
    return response.data;
  },

  async updatePosition(id: number, data: Partial<Position>): Promise<Position> {
    const response = await api.put<Position>(`/company/positions/${id}`, data);
    return response.data;
  },

  async deletePosition(id: number): Promise<void> {
    await api.delete(`/company/positions/${id}`);
  },
};
