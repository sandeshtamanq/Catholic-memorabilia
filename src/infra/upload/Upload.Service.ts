import { BadRequestException, Injectable } from '@nestjs/common';
import { S3StorageService } from '../supabase/Supabase.Service';

@Injectable()
export class UploadService {
  constructor(private readonly supabaseService: S3StorageService) {}

  async uploadImage(file: Express.Multer.File, folder = 'uploads') {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    const safeFileName = file.originalname.replace(/\s+/g, '-');
    const key = `${folder}/${Date.now()}-${safeFileName}`;
    const imageUrl = await this.supabaseService.uploadFile('proj', key, file);

    return {
      imageUrl,
      key,
      folder,
      fileName: safeFileName,
    };
  }
}
