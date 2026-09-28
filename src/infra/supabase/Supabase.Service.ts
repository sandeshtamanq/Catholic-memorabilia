import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageService {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      forcePathStyle: true, // required for Supabase
      region: process.env.SUPABASE_S3_REGION,
      endpoint: process.env.SUPABASE_S3_ENDPOINT, // https://<project-ref>.storage.supabase.co/storage/v1/s3
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(bucket: string, key: string, file: Express.Multer.File) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    // Public URL if the bucket is public:
    return `${process.env.SUPABASE_PUBLIC_URL}/object/public/${bucket}/${key}`;
  }
}
