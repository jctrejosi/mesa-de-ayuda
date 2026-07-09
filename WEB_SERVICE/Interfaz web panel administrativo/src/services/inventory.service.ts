import api from "./api";
import type {
  InventoryItem,
  ListInventoryParams,
  PaginatedInventoryResponse,
  ParseInventoryResponse,
  SaveInventoryItemDto,
  UploadInventoryResponse,
} from "../types/inventory.types";

export const inventoryService = {
  /**
   * Previsualizar archivo de inventario (INVE.TXT)
   * POST /inventory/parse
   * @param file - Archivo de texto a parsear
   * @returns Lista de productos parseados
   */
  async parseFile(file: File): Promise<ParseInventoryResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ParseInventoryResponse>(
      "/inventory/parse",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const data = response.data;
    return data;
  },

  /**
   * Guardar productos en la base de datos (con imágenes)
   * POST /inventory/upload
   * @param products - Lista de productos a guardar
   * @param images - Array de archivos de imagen (en el mismo orden que los productos)
   * @returns Resultado de la operación
   */
  async uploadProducts(
    products: SaveInventoryItemDto[],
    images: File[],
  ): Promise<UploadInventoryResponse> {
    if (products.length !== images.length) {
      throw new Error(
        "El número de productos debe coincidir con el número de imágenes",
      );
    }

    const formData = new FormData();
    formData.append("products", JSON.stringify(products));

    // Agregar imágenes en el mismo orden
    for (const image of images) {
      formData.append("images", image);
    }

    const response = await api.post<UploadInventoryResponse>(
      "/inventory/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const data = response.data;
    return data;
  },

  /**
   * Guardar productos sin imágenes (solo datos)
   * Útil si solo quieres actualizar la tabla sin imágenes
   * POST /inventory/upload (con products pero sin images)
   */
  async uploadProductsOnly(
    products: SaveInventoryItemDto[],
  ): Promise<UploadInventoryResponse> {
    const formData = new FormData();
    formData.append("products", JSON.stringify(products));

    const response = await api.post<UploadInventoryResponse>(
      "/inventory/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const data = response.data;
    return data;
  },

  /**
   * Listar inventario con paginación, búsqueda y ordenamiento
   * POST /inventory/list
   * @param params - Parámetros de paginación, búsqueda y orden
   * @returns Lista paginada de productos
   */
  async list(
    params: ListInventoryParams = {},
  ): Promise<PaginatedInventoryResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "codigo",
      sortOrder = "ASC",
    } = params;

    const response = await api.post<PaginatedInventoryResponse>(
      "/inventory/list",
      {
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      },
    );

    const data = response.data;
    return data;
  },
};
