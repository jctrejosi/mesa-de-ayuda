import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { getDb } from '../../database/drizzle';
import { inventory, type NewInventory } from '../../database/schema';
import { asc, desc, eq, or, sql } from 'drizzle-orm';
import { ListInventoryDto } from './dto/list-inventory.dto';
import { CloudinaryService } from './cloudinary.service';

export interface ParsedProduct {
  codigo: string;
  plu: string;
  ean: string;
  nombre: string;
  precio_venta: number;
  saldo: number;
  imagen: string;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  private get db() {
    return getDb();
  }

  /**
   * Listar productos con paginación, búsqueda y ordenamiento
   */
  async findAll(query: ListInventoryDto): Promise<{
    items: (typeof inventory.$inferSelect)[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const offset = (page - 1) * limit;

    const search = query.search?.trim();
    const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const sortColumnMap = {
      codigo: inventory.codigo,
      nombre: inventory.nombre,
      precio_venta: inventory.precio_venta,
      saldo: inventory.saldo,
      plu: inventory.plu,
      ean: inventory.ean,
      createdAt: inventory.createdAt,
    } as const;

    const orderColumn =
      sortColumnMap[query.sortBy as keyof typeof sortColumnMap] ??
      inventory.codigo;

    const whereClause = search
      ? or(
          sql`LOWER(${inventory.codigo}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${inventory.nombre}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${inventory.plu}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${inventory.ean}) LIKE ${`%${search.toLowerCase()}%`}`,
        )
      : undefined;

    const items = await this.db
      .select()
      .from(inventory)
      .where(whereClause)
      .orderBy(sortOrder === 'DESC' ? desc(orderColumn) : asc(orderColumn))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(inventory)
      .where(whereClause);

    return {
      items,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    };
  }

  /**
   * Parsea el contenido del archivo de texto y devuelve los productos
   */
  parseFile(fileBuffer: Buffer): ParsedProduct[] {
    const content = fileBuffer.toString('utf-8');
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    // Asumimos que la primera línea es el encabezado, la saltamos
    const dataLines = lines.slice(1);

    const products: ParsedProduct[] = [];

    for (const line of dataLines) {
      // El separador es '|' pero puede haber espacios alrededor
      const parts = line.split('|').map((part) => part.trim());

      if (parts.length < 7) {
        this.logger.warn(`Línea con formato incorrecto: ${line}`);
        continue;
      }

      const [codigo, plu, ean, nombre, venta, saldo, imagen] = parts;

      const precioVenta = parseFloat(venta.replace(/,/g, ''));
      const saldoNum = parseInt(saldo, 10);

      if (isNaN(precioVenta) || isNaN(saldoNum)) {
        this.logger.warn(`Datos numéricos inválidos en línea: ${line}`);
        continue;
      }

      products.push({
        codigo,
        plu,
        ean,
        nombre,
        precio_venta: precioVenta,
        saldo: saldoNum,
        imagen,
      });
    }

    return products;
  }

  /**
   * Guarda los productos en la base de datos (upsert por código)
   */
  async saveProducts(
    products: ParsedProduct[],
  ): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    for (const product of products) {
      const existing = await this.db
        .select()
        .from(inventory)
        .where(eq(inventory.codigo, product.codigo))
        .limit(1);

      const newInventory: NewInventory = {
        codigo: product.codigo,
        plu: product.plu || null,
        ean: product.ean || null,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        saldo: product.saldo,
        imagen: product.imagen || null,
      };

      if (existing.length > 0) {
        // Actualizar
        await this.db
          .update(inventory)
          .set({
            plu: newInventory.plu,
            ean: newInventory.ean,
            nombre: newInventory.nombre,
            precio_venta: newInventory.precio_venta,
            saldo: newInventory.saldo,
            imagen: newInventory.imagen,
            updatedAt: new Date(),
          })
          .where(eq(inventory.codigo, product.codigo));
        updated++;
      } else {
        // Insertar
        await this.db.insert(inventory).values(newInventory);
        inserted++;
      }
    }

    return { inserted, updated };
  }

  /**
   * Guarda un conjunto de productos con sus imágenes asociadas
   * Las imágenes se suben a Cloudinary y se guarda la URL
   */
  async saveWithImages(
    products: ParsedProduct[],
    files: Express.Multer.File[],
  ): Promise<{ inserted: number; updated: number; imagesUploaded: number }> {
    if (products.length !== files.length) {
      throw new BadRequestException(
        'El número de productos no coincide con el número de imágenes',
      );
    }

    // Subir todas las imágenes a Cloudinary (una por una)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const file = files[i];

      const imageUrl = await this.cloudinaryService.uploadImage(
        file,
        product.codigo,
      );
      product.imagen = imageUrl;
    }

    // Guardar productos en BD (con las URLs de Cloudinary)
    this.logger.debug('Iniciando saveProducts');

    const result = await this.saveProducts(products);

    this.logger.debug(result);
    return { ...result, imagesUploaded: products.length };
  }
}
