// src/services/inventory.service.ts
import { api } from "./api";

// DTOs basados en el backend
export interface InventoryItem {
  codigo: string;
  plu: string | null;
  ean: string | null;
  nombre: string;
  precio_venta: number;
  saldo: number;
  imagen: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListInventoryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | "codigo"
    | "nombre"
    | "precio_venta"
    | "saldo"
    | "plu"
    | "ean"
    | "createdAt";
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedInventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class InventoryService {
  /**
   * Obtener lista de inventario con paginación, búsqueda y ordenamiento
   * POST /inventory/list
   */
  static async list(
    dto: ListInventoryDto = {},
  ): Promise<PaginatedInventoryResponse> {
    console.log("📦 [Inventory] Listando inventario:", dto);

    const response = await api.post("/inventory/list", {
      page: dto.page || 1,
      limit: dto.limit || 20,
      search: dto.search || "",
      sortBy: dto.sortBy || "codigo",
      sortOrder: dto.sortOrder || "ASC",
    });

    // Extraer los datos de la respuesta
    const data = response.data.data || response.data;

    console.log("📦 [Inventory] Respuesta:", data);
    return data;
  }

  /**
   * Obtener un producto por código
   * (si el backend lo soporta)
   */
  static async getByCodigo(codigo: string): Promise<InventoryItem | null> {
    // Podrías implementar un endpoint específico o filtrar del listado
    try {
      const response = await api.get(`/inventory/${codigo}`);
      return response.data.data || response.data;
    } catch {
      return null;
    }
  }

  /**
   * Buscar productos por término
   */
  static async search(
    term: string,
    limit: number = 10,
  ): Promise<InventoryItem[]> {
    const response = await this.list({
      search: term,
      limit,
      page: 1,
    });
    return response.items;
  }
}
