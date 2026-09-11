import { Module } from '@nestjs/common';
import { FirebaseService } from './FIrebase.Service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
