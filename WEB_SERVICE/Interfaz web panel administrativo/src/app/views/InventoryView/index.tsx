// ════════════════════════════════════════════════════════════════════════
// ─── INVENTORY VIEW ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

import { useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Users,
  Clock,
  AlertTriangle,
  XCircle,
  MoreVertical,
  X,
  Download,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Save,
  Map,
  LogIn,
  LogOut,
  Eye,
  SlidersHorizontal,
  Navigation,
  Wifi,
  Building2,
  UserCog,
  ShieldCheck,
  QrCode,
  Paperclip,
  Lock,
  Briefcase,
  UserCheck,
  UserX,
  Edit3,
  PauseCircle,
  RefreshCw,
  BarChart2,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  Boxes,
  BadgeAlert,
  ChevronUp,
} from "lucide-react";

interface Product {
  id: string;
  code: string;
  plu: string;
  ean: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

type InvSortField = keyof Product;
type SortDir = "asc" | "desc" | null;

const PRODUCTS: Product[] = [
  {
    id: "p01",
    code: "PRD-001",
    plu: "1001",
    ean: "7701234000010",
    name: "Arroz Diana x 500g",
    price: 3_200,
    stock: 148,
    category: "Granos",
  },
  {
    id: "p02",
    code: "PRD-002",
    plu: "1002",
    ean: "7701234000027",
    name: "Aceite Girasol 1L",
    price: 9_800,
    stock: 62,
    category: "Aceites",
  },
  {
    id: "p03",
    code: "PRD-003",
    plu: "1003",
    ean: "7701234000034",
    name: "Azúcar Riopaila x 1kg",
    price: 4_500,
    stock: 5,
    category: "Endulzantes",
  },
  {
    id: "p04",
    code: "PRD-004",
    plu: "1004",
    ean: "7701234000041",
    name: "Leche Alpina Entera 1L",
    price: 5_200,
    stock: 0,
    category: "Lácteos",
  },
  {
    id: "p05",
    code: "PRD-005",
    plu: "1005",
    ean: "7701234000058",
    name: "Harina de Trigo Bienestarina",
    price: 3_800,
    stock: 34,
    category: "Harinas",
  },
  {
    id: "p06",
    code: "PRD-006",
    plu: "1006",
    ean: "7701234000065",
    name: "Café Sello Rojo x 250g",
    price: 12_500,
    stock: 8,
    category: "Bebidas",
  },
  {
    id: "p07",
    code: "PRD-007",
    plu: "1007",
    ean: "7701234000072",
    name: "Jabón Rey x 300g",
    price: 2_900,
    stock: 0,
    category: "Aseo",
  },
  {
    id: "p08",
    code: "PRD-008",
    plu: "1008",
    ean: "7701234000089",
    name: "Shampoo Head & Shoulders 400ml",
    price: 24_900,
    stock: 17,
    category: "Cuidado Personal",
  },
  {
    id: "p09",
    code: "PRD-009",
    plu: "1009",
    ean: "7701234000096",
    name: "Detergente Ariel x 2kg",
    price: 31_500,
    stock: 3,
    category: "Aseo",
  },
  {
    id: "p10",
    code: "PRD-010",
    plu: "1010",
    ean: "7701234000102",
    name: "Atún Van Camps 170g",
    price: 6_700,
    stock: 92,
    category: "Conservas",
  },
  {
    id: "p11",
    code: "PRD-011",
    plu: "1011",
    ean: "7701234000119",
    name: "Mantequilla Colanta x 100g",
    price: 4_100,
    stock: 0,
    category: "Lácteos",
  },
  {
    id: "p12",
    code: "PRD-012",
    plu: "1012",
    ean: "7701234000126",
    name: "Pasta Doria Espagueti 500g",
    price: 3_600,
    stock: 55,
    category: "Pastas",
  },
  {
    id: "p13",
    code: "PRD-013",
    plu: "1013",
    ean: "7701234000133",
    name: "Salsa de Tomate Fruco 400g",
    price: 5_900,
    stock: 7,
    category: "Salsas",
  },
  {
    id: "p14",
    code: "PRD-014",
    plu: "1014",
    ean: "7701234000140",
    name: "Lentejas La Granja x 500g",
    price: 4_200,
    stock: 23,
    category: "Granos",
  },
  {
    id: "p15",
    code: "PRD-015",
    plu: "1015",
    ean: "7701234000157",
    name: "Papel Higiénico Familia x12",
    price: 22_800,
    stock: 41,
    category: "Aseo",
  },
  {
    id: "p16",
    code: "PRD-016",
    plu: "1016",
    ean: "7701234000164",
    name: "Yogur Alpina Fresa 200g",
    price: 3_300,
    stock: 9,
    category: "Lácteos",
  },
  {
    id: "p17",
    code: "PRD-017",
    plu: "1017",
    ean: "7701234000171",
    name: "Galletas Oreo x 48g",
    price: 2_500,
    stock: 0,
    category: "Snacks",
  },
  {
    id: "p18",
    code: "PRD-018",
    plu: "1018",
    ean: "7701234000188",
    name: "Agua Cristal 600ml",
    price: 1_800,
    stock: 204,
    category: "Bebidas",
  },
  {
    id: "p19",
    code: "PRD-019",
    plu: "1019",
    ean: "7701234000195",
    name: "Avena Quaker x 200g",
    price: 4_800,
    stock: 6,
    category: "Cereales",
  },
  {
    id: "p20",
    code: "PRD-020",
    plu: "1020",
    ean: "7701234000201",
    name: "Crema Dental Colgate 75ml",
    price: 8_900,
    stock: 38,
    category: "Cuidado Personal",
  },
];

const StockChip = ({ stock }: { stock: number }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Agotado
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Crítico
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Normal
    </span>
  );
};

const fmtCOP = (v: number, compact = false) => {
  if (compact) {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  }
  return "$" + v.toLocaleString("es-CO");
};

export const InventoryView = ({
  addToast,
}: {
  addToast: (m: string, t: "success" | "error") => void;
}) => {
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "critical" | "out">(
    "all",
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortField, setSortField] = useState<InvSortField>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const criticalCount = PRODUCTS.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;
  const outCount = PRODUCTS.filter((p) => p.stock === 0).length;
  const totalValue = PRODUCTS.reduce((s, p) => s + p.price * p.stock, 0);

  const handleSort = (field: InvSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else setSortDir("asc");
  };

  const filtered = PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    if (
      q &&
      !p.name.toLowerCase().includes(q) &&
      !p.code.toLowerCase().includes(q) &&
      !p.ean.includes(q) &&
      !p.plu.includes(q)
    )
      return false;
    if (quickFilter === "critical" && !(p.stock > 0 && p.stock <= 10))
      return false;
    if (quickFilter === "out" && p.stock !== 0) return false;
    if (minPrice && p.price < parseInt(minPrice)) return false;
    if (maxPrice && p.price > parseInt(maxPrice)) return false;
    return true;
  }).sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (typeof va === "number" && typeof vb === "number")
      return sortDir === "asc" ? va - vb : vb - va;
    return sortDir === "asc"
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortTH = ({
    field,
    children,
  }: {
    field: InvSortField;
    children: React.ReactNode;
  }) => {
    const active = sortField === field;
    return (
      <th
        className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] whitespace-nowrap cursor-pointer hover:text-slate-700 select-none group"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          <span
            className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
          >
            {active && sortDir === "asc" ? (
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Catálogo de productos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {PRODUCTS.length} productos registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm">
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
                {criticalCount} producto{criticalCount > 1 ? "s" : ""} con stock
                crítico
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-20 h-8 px-2 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 [appearance:textfield]"
          />
          <span className="text-xs">—</span>
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
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
          {filtered.length} resultados
        </p>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
              <Package size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">Sin productos</p>
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
                <SortTH field="code">Código</SortTH>
                <SortTH field="plu">PLU</SortTH>
                <SortTH field="ean">EAN</SortTH>
                <SortTH field="name">Nombre del producto</SortTH>
                <SortTH field="price">Precio venta</SortTH>
                <SortTH field="stock">Saldo</SortTH>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-border hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Boxes size={14} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {p.code}
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
                      <p className="font-medium text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {p.category}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {fmtCOP(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold tabular-nums ${p.stock === 0 ? "text-red-600" : p.stock <= 10 ? "text-amber-600" : "text-slate-700"}`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StockChip stock={p.stock} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination + summary */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              {filtered.length} de {PRODUCTS.length} productos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Normal: {PRODUCTS.filter((p) => p.stock > 10).length}
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
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronDown size={13} className="rotate-90" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronDown size={13} className="-rotate-90" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer summary card */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Total productos
          </p>
          <p className="text-2xl font-bold text-slate-800">{PRODUCTS.length}</p>
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
  );
};
