// ─── Tipos base ──────────────────────────────────────────────────────────────

export interface InventoryItem {
  codigo: string;
  plu: string;
  ean: string;
  nombre: string;
  precio_venta: number;
  saldo: number;
  imagen: string; // nombre del archivo original o ruta
}

// ─── Respuesta de parseo (POST /inventory/parse) ────────────────────────────

export interface ParseInventoryResponse {
  items: InventoryItem[];
  count: number;
}

// ─── DTO para guardar (POST /inventory/upload) ──────────────────────────────

export interface SaveInventoryItemDto {
  codigo: string;
  plu?: string;
  ean?: string;
  nombre: string;
  precio_venta: number;
  saldo: number;
  imagen?: string; // nombre del archivo original (para mapear con la imagen subida)
}

export interface SaveInventoryDto {
  items: SaveInventoryItemDto[];
}

// ─── Respuesta de guardado ──────────────────────────────────────────────────

export interface UploadInventoryResponse {
  inserted: number;
  updated: number;
  imagesUploaded: number;
}

// ─── Estado del producto (para UI) ────────────────────────────────────────────

export interface InventoryProduct extends InventoryItem {
  // campos adicionales para UI
  selected?: boolean;
  imageFile?: File | null;
  imageUrl?: string;
  status?: "new" | "updated" | "unchanged";
}

// ─── Respuesta paginada del listado ──────────────────────────────────────────

export interface PaginatedInventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Parámetros para listar ──────────────────────────────────────────────────

export interface ListInventoryParams {
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
