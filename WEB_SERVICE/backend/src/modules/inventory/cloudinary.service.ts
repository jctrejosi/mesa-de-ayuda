import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary credentials not configured.');
      throw new Error('Cloudinary credentials are required');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log('Cloudinary service initialized successfully');
  }

  /**
   * Sube una imagen a Cloudinary y devuelve la URL pública
   */
  async uploadImage(
    file: Express.Multer.File,
    productCode: string,
  ): Promise<string> {
    try {
      if (!cloudinary.config().cloud_name) {
        throw new Error('Cloudinary no configurado');
      }

      // Subir a Cloudinary con carpeta organizada
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `inventory/${productCode}`,
            public_id: `${productCode}_${Date.now()}`,
            use_filename: true,
            unique_filename: false,
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error('Cloudinary no devolvió un resultado.'));
              return;
            }

            resolve(result);
          },
        );

        // Convertir buffer a stream
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });

      const secureUrl = result.secure_url;
      this.logger.log(`Imagen subida a Cloudinary: ${secureUrl}`);
      return secureUrl;
    } catch (error) {
      this.logger.error('Error subiendo a Cloudinary:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Error al subir imagen: ${message}`);
    }
  }

  /**
   * Sube múltiples imágenes a Cloudinary
   */
  async uploadImages(
    files: Express.Multer.File[],
    productCodes: string[],
  ): Promise<string[]> {
    if (files.length !== productCodes.length) {
      throw new BadRequestException(
        'Número de imágenes no coincide con productos',
      );
    }

    const results: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await this.uploadImage(files[i], productCodes[i]);
      results.push(url);
    }
    return results;
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      if (!cloudinary.config().cloud_name) return;
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Imagen eliminada de Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error('Error eliminando imagen de Cloudinary:', error);
    }
  }

  /**
   * Obtiene una URL optimizada de una imagen
   */
  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): string {
    if (!cloudinary.config().cloud_name) return publicId;

    return cloudinary.url(publicId, {
      width: options?.width || 200,
      height: options?.height || 200,
      quality: options?.quality || 80,
      crop: 'fill',
      fetch_format: 'auto',
      secure: true,
    });
  }
}
