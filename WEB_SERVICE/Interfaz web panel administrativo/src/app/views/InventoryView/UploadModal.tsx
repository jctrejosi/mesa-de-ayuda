import { useState, useRef } from "react";

import {
  X,
  Upload,
  FileText,
  Image,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";

import { inventoryService } from "../../../services/inventory.service";
import type {
  InventoryItem,
  SaveInventoryItemDto,
} from "../../../types/inventory.types";

// ─── Modal de carga de inventario ────────────────────────────────────────────

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (m: string, t: "success" | "error") => void;
}

export const UploadInventoryModal = ({
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
  const singleImageInputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || selectedIndex === null) return;

    const newImages = [...imageFiles];
    newImages[selectedIndex] = file;

    setImageFiles(newImages);
    setSelectedIndex(null);

    // Permite volver a seleccionar el mismo archivo
    e.target.value = "";
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
              {step === "upload" && "Selecciona el archivo .TXT y las imágenes"}
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
                  {txtFile ? txtFile.name : "Haz clic para seleccionar .TXT"}
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
                <input
                  ref={singleImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSingleImageChange}
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
                                onClick={() => {
                                  setSelectedIndex(idx);
                                  singleImageInputRef.current?.click();
                                }}
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
