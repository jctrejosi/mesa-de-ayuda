// ════════════════════════════════════════════════════════════════════════
// ─── INVENTORY VIEW ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";

import {
  Search,
  ChevronDown,
  X,
  Download,
  Plus,
  Package,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Boxes,
  BadgeAlert,
  Upload,
  FileText,
  Image,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { StockChip } from "./StockChip";
import { inventoryService } from "../../../services/inventory.service";
import type {
  InventoryItem,
  SaveInventoryItemDto,
} from "../../../types/inventory.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCOP = (v: number, compact = false) => {
  if (compact) {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  }
  return "$" + v.toLocaleString("es-CO");
};

// ─── Modal de carga de inventario ────────────────────────────────────────────

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (m: string, t: "success" | "error") => void;
}

const UploadInventoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}: UploadModalProps) => {
  const [step, setStep] = useState<"upload" | "preview" | "saving">("upload");
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<InventoryItem[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    inserted: number;
    updated: number;
    imagesUploaded: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección del archivo txt
  const handleTxtFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTxtFile(file);
    setIsLoading(true);

    try {
      const result = await inventoryService.parseFile(file);
      setParsedItems(result.items);
      // Inicializar array de imágenes con null para cada producto
      setImageFiles(new Array(result.items.length).fill(null));
      setStep("preview");
      addToast(
        `Archivo parseado: ${result.count} productos encontrados`,
        "success",
      );
    } catch (error) {
      console.error(error);
      addToast("Error al parsear el archivo", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar selección de imágenes
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [...imageFiles];
    // Asignar cada archivo en orden
    for (let i = 0; i < Math.min(files.length, newImages.length); i++) {
      newImages[i] = files[i];
    }
    setImageFiles(newImages);
  };

  // Asignar imagen individual a un producto (desde el botón de cada fila)
  const assignImageToProduct = (index: number, file: File | null) => {
    const newImages = [...imageFiles];
    newImages[index] = file;
    setImageFiles(newImages);
  };

  // Validar que todas las imágenes estén seleccionadas
  const allImagesSelected = imageFiles.every((img) => img !== null);

  // Guardar en el backend
  const handleSave = async () => {
    if (!allImagesSelected) {
      addToast("Debes seleccionar una imagen para cada producto", "error");
      return;
    }

    setIsLoading(true);
    setStep("saving");

    try {
      const productsToSave: SaveInventoryItemDto[] = parsedItems.map(
        (item) => ({
          codigo: item.codigo,
          plu: item.plu,
          ean: item.ean,
          nombre: item.nombre,
          precio_venta: item.precio_venta,
          saldo: item.saldo,
          imagen: item.imagen, // nombre original del archivo (opcional)
        }),
      );

      const validImages = imageFiles.filter((img) => img !== null) as File[];

      const result = await inventoryService.uploadProducts(
        productsToSave,
        validImages,
      );
      setUploadResult(result);
      addToast(
        `Guardado: ${result.inserted} insertados, ${result.updated} actualizados`,
        "success",
      );
      onSuccess();
      // Cerrar después de 2 segundos
      setTimeout(() => {
        onClose();
        setStep("upload");
        setTxtFile(null);
        setParsedItems([]);
        setImageFiles([]);
        setUploadResult(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      addToast("Error al guardar los productos", "error");
      setStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear todo al cerrar
  const handleClose = () => {
    setStep("upload");
    setTxtFile(null);
    setParsedItems([]);
    setImageFiles([]);
    setUploadResult(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden z-10 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Upload size={18} className="text-blue-600" />
              Cargar inventario
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === "upload" &&
                "Selecciona el archivo INVE.TXT y las imágenes"}
              {step === "preview" &&
                `Previsualización (${parsedItems.length} productos)`}
              {step === "saving" && "Guardando en la base de datos..."}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Paso 1: Subir archivo */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  {txtFile
                    ? txtFile.name
                    : "Haz clic para seleccionar INVE.TXT"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formato: Codigo|Plu|Ean|Nombre|Venta|Saldo|Imagen
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleTxtFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Seleccionar archivo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Previsualización y asignación de imágenes */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">{parsedItems.length}</span>{" "}
                  productos encontrados
                </p>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <Image size={13} />
                  Seleccionar imágenes
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        #
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        Nombre
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        Imagen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item, idx) => (
                      <tr
                        key={item.codigo}
                        className="border-b border-border hover:bg-slate-50/50"
                      >
                        <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {item.codigo}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {item.nombre}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {imageFiles[idx] ? (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle
                                  size={14}
                                  className="text-green-500"
                                />
                                <span className="text-xs text-slate-500 truncate max-w-32">
                                  {imageFiles[idx]?.name}
                                </span>
                                <button
                                  onClick={() =>
                                    assignImageToProduct(idx, null)
                                  }
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => imageInputRef.current?.click()}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Image size={12} /> Asignar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                {allImagesSelected ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Todas las imágenes asignadas
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle size={14} />{" "}
                    {imageFiles.filter((f) => f !== null).length} /{" "}
                    {parsedItems.length} imágenes asignadas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Guardando */}
          {step === "saving" && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">
                Guardando productos...
              </p>
              <p className="text-xs text-slate-400 mt-1">Por favor espera</p>
            </div>
          )}

          {/* Resultado */}
          {uploadResult && step === "saving" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  ¡Guardado exitoso!
                </p>
                <p className="text-xs text-green-700">
                  {uploadResult.inserted} insertados, {uploadResult.updated}{" "}
                  actualizados, {uploadResult.imagesUploaded} imágenes subidas
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="h-8 px-4 rounded-lg border border-border text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          {step === "preview" && (
            <button
              onClick={handleSave}
              disabled={!allImagesSelected || isLoading}
              className="h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              Guardar en BD
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

export const InventoryView = ({
  addToast,
}: {
  addToast: (m: string, t: "success" | "error") => void;
}) => {
  // ─── Estados ──────────────────────────────────────────────────────────────

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filtros y orden
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "critical" | "out">(
    "all",
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<
    "codigo" | "nombre" | "precio_venta" | "saldo" | "plu" | "ean"
  >("codigo");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Modal de upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // ─── Carga de datos ──────────────────────────────────────────────────────

  const loadProducts = useCallback(
    async (resetList = true) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: resetList ? 1 : page,
          limit,
          sortBy,
          sortOrder,
        };

        // Aplicar búsqueda
        if (search) params.search = search;

        // Filtros rápidos se traducen a búsqueda o rango de stock
        if (quickFilter === "critical") {
          // Podríamos agregar un filtro por stock > 0 y <= 10 si el backend lo soporta
          // Por ahora, lo haremos en el frontend (se aplica después)
        }
        if (quickFilter === "out") {
          // similar
        }
        if (minPrice) params.minPrice = parseInt(minPrice);
        if (maxPrice) params.maxPrice = parseInt(maxPrice);

        const result = await inventoryService.list(params);

        if (resetList) {
          setItems(result.items);
        } else {
          setItems((prev) => [...prev, ...result.items]);
        }

        setTotal(result.total);
        setTotalPages(result.totalPages);
        setHasMore(result.page < result.totalPages);
        setPage(result.page + 1); // preparar para la siguiente página
      } catch (err) {
        console.error(err);
        setError("Error al cargar el inventario");
        addToast("Error al cargar el inventario", "error");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, quickFilter, minPrice, maxPrice, sortBy, sortOrder],
  );

  // Carga inicial
  useEffect(() => {
    loadProducts(true);
  }, [search, quickFilter, minPrice, maxPrice, sortBy, sortOrder]);

  // ─── Manejadores ──────────────────────────────────────────────────────────

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    loadProducts(false);
  };

  const handleRefresh = () => {
    setPage(1);
    loadProducts(true);
  };

  // ─── Cálculos de estadísticas ────────────────────────────────────────────

  // Nota: estas estadísticas se calculan sobre los items cargados,
  // idealmente vendrían del backend con un endpoint de resumen.
  const criticalCount = items.filter(
    (p) => p.saldo > 0 && p.saldo <= 10,
  ).length;
  const outCount = items.filter((p) => p.saldo === 0).length;
  const totalValue = items.reduce((s, p) => s + p.precio_venta * p.saldo, 0);

  // ─── UI ──────────────────────────────────────────────────────────────────

  const SortTH = ({
    field,
    children,
  }: {
    field: typeof sortBy;
    children: React.ReactNode;
  }) => {
    const active = sortBy === field;
    return (
      <th
        className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] whitespace-nowrap cursor-pointer hover:text-slate-700 select-none group"
        onClick={() => {
          if (sortBy === field) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
          } else {
            setSortBy(field);
            setSortOrder("ASC");
          }
        }}
      >
        <div className="flex items-center gap-1">
          {children}
          <span
            className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
          >
            {active && sortOrder === "ASC" ? (
              <ArrowUp size={10} />
            ) : (
              <ArrowDown size={10} />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Catálogo de productos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {total} productos registrados
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Upload size={13} /> Cargar inventario
            </button>
            <button className="h-8 px-3 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 flex items-center gap-1.5 transition-colors shadow-sm">
              <Plus size={13} /> Agregar producto
            </button>
            <button
              onClick={() => addToast("Exportación CSV iniciada", "success")}
              className="h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>

        {/* Stock alert banner */}
        {(criticalCount > 0 || outCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <BadgeAlert size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800 flex-1">
              <span className="font-semibold">Alertas de stock:</span>{" "}
              {criticalCount > 0 && (
                <button
                  onClick={() => {
                    setQuickFilter("critical");
                    setPage(1);
                  }}
                  className="underline hover:no-underline mr-2"
                >
                  {criticalCount} producto{criticalCount > 1 ? "s" : ""} con
                  stock crítico
                </button>
              )}
              {outCount > 0 && (
                <button
                  onClick={() => {
                    setQuickFilter("out");
                    setPage(1);
                  }}
                  className="underline hover:no-underline"
                >
                  {outCount} producto{outCount > 1 ? "s" : ""} agotado
                  {outCount > 1 ? "s" : ""}
                </button>
              )}
            </p>
            {quickFilter !== "all" && (
              <button
                onClick={() => {
                  setQuickFilter("all");
                  setPage(1);
                }}
                className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 font-medium"
              >
                <X size={12} /> Quitar filtro
              </button>
            )}
          </div>
        )}

        {/* Search + Filters */}
        <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Nombre, código o EAN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>

          {/* Quick filters */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-border">
            {(
              [
                ["all", "Todos"],
                ["critical", `Stock crítico (${criticalCount})`],
                ["out", `Agotados (${outCount})`],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => {
                  setQuickFilter(v);
                  setPage(1);
                }}
                className={`h-6 px-3 rounded-md text-xs font-medium transition-colors ${quickFilter === v ? "bg-white shadow text-slate-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <DollarSign size={13} />
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 h-8 px-2 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 [appearance:textfield]"
            />
            <span className="text-xs">—</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 h-8 px-2 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 [appearance:textfield]"
            />
          </div>

          {(search || quickFilter !== "all" || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSearch("");
                setQuickFilter("all");
                setMinPrice("");
                setMaxPrice("");
                setPage(1);
              }}
              className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <X size={12} /> Limpiar
            </button>
          )}

          <p className="ml-auto text-xs text-slate-400">
            {items.length} de {total} mostrados
          </p>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          {loading && items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-500">
                Cargando productos...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <AlertCircle size={32} className="text-red-500" />
              <p className="text-sm font-medium text-slate-500">{error}</p>
              <button
                onClick={() => loadProducts(true)}
                className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Package size={24} className="text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                Sin productos
              </p>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                No se encontraron productos con los filtros aplicados.
              </p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] w-12">
                    Img
                  </th>
                  <SortTH field="codigo">Código</SortTH>
                  <SortTH field="plu">PLU</SortTH>
                  <SortTH field="ean">EAN</SortTH>
                  <SortTH field="nombre">Nombre del producto</SortTH>
                  <SortTH field="precio_venta">Precio venta</SortTH>
                  <SortTH field="saldo">Saldo</SortTH>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, i) => (
                  <tr
                    key={p.codigo}
                    className={`border-b border-border hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      {p.imagen ? (
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Boxes size={14} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {p.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {p.plu}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">
                      {p.ean}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-700">{p.nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {fmtCOP(p.precio_venta)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold tabular-nums ${p.saldo === 0 ? "text-red-600" : p.saldo <= 10 ? "text-amber-600" : "text-slate-700"}`}
                      >
                        {p.saldo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StockChip stock={p.saldo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer con paginación y "Ver más" */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                {items.length} de {total} productos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Normal: {items.filter((p) => p.saldo > 10).length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Crítico: {criticalCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Agotado: {outCount}
              </span>
            </div>
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Ver más"
                )}
              </button>
            )}
            {!hasMore && items.length > 0 && (
              <span className="text-xs text-slate-400">
                No hay más registros
              </span>
            )}
          </div>
        </div>

        {/* Footer summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Total productos
            </p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Agotados
            </p>
            <p className="text-2xl font-bold text-red-600">{outCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Stock crítico
            </p>
            <p className="text-2xl font-bold text-amber-600">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Valor total inventario
            </p>
            <p className="text-lg font-bold text-slate-800">
              {fmtCOP(totalValue, true)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {fmtCOP(totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <UploadInventoryModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => {
              // Refrescar la lista después de subir
              setPage(1);
              loadProducts(true);
              addToast("Inventario actualizado correctamente", "success");
            }}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
    </>
  );
};
