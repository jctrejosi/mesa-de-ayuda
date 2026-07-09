import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ParseInventoryResponseDto } from './dto/inventory-response.dto';
import type {} from 'multer';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Endpoint para previsualizar el archivo de inventario
   * POST /inventory/parse
   * Recibe el archivo .txt y devuelve los datos parseados
   */
  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Previsualizar archivo de inventario (INVE.TXT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo de inventario (formato: Codigo|Plu|Ean|Nombre|Venta|Saldo|Imagen)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Datos parseados correctamente',
    type: ParseInventoryResponseDto,
  })
  parseFile(
    @UploadedFile() file: Express.Multer.File,
  ): ParseInventoryResponseDto {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const items = this.inventoryService.parseFile(file.buffer);
    return {
      items,
      count: items.length,
    };
  }

  /**
   * Endpoint para guardar los productos en la base de datos (con imágenes)
   * POST /inventory/upload
   * Recibe los datos de productos (JSON) y las imágenes (archivos)
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images', 50)) // hasta 50 imágenes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Guardar productos en la base de datos (con imágenes)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos de productos e imágenes',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'string',
          description:
            'JSON con array de productos (cada producto debe tener: codigo, nombre, precio_venta, saldo, etc.)',
          example:
            '[{"codigo":"101130100000100","nombre":"ARVEJA/ZANAHORIA SAN JORGE 180G","precio_venta":5700,"saldo":41,"plu":"100","ean":"7702014393484"}]',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Archivos de imagen en el mismo orden que los productos',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Productos guardados exitosamente',
    schema: {
      example: { inserted: 10, updated: 4, imagesUploaded: 14 },
    },
  })
  async uploadProducts(
    @Body('products') productsJson: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ inserted: number; updated: number; imagesUploaded: number }> {
    if (!productsJson) {
      throw new BadRequestException('El campo "products" es requerido');
    }

    type UploadProductDto = {
      codigo: string;
      plu?: string;
      ean?: string;
      nombre: string;
      precio_venta: number;
      saldo: number;
    };

    let products: UploadProductDto[];
    try {
      products = JSON.parse(productsJson) as UploadProductDto[];
    } catch {
      throw new BadRequestException(
        'El campo "products" debe ser un JSON válido',
      );
    }

    if (!Array.isArray(products)) {
      throw new BadRequestException('"products" debe ser un array');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Se requieren imágenes');
    }

    if (products.length !== files.length) {
      throw new BadRequestException(
        `El número de productos (${products.length}) no coincide con el número de imágenes (${files.length})`,
      );
    }

    // Mapear a ParsedProduct (usando el nombre de archivo original en cada producto)
    const parsedProducts = products.map((p, index) => ({
      codigo: p.codigo,
      plu: p.plu || '',
      ean: p.ean || '',
      nombre: p.nombre,
      precio_venta: p.precio_venta,
      saldo: p.saldo,
      imagen: files[index].originalname, // guardamos el nombre original para referencia, luego se reemplazará
    }));

    return this.inventoryService.saveWithImages(parsedProducts, files);
  }
}
