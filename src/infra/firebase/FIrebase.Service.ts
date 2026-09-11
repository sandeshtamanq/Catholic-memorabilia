import { Injectable } from '@nestjs/common';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import {
  firebaseConfig,
  initializeFirebaseApp,
} from '../../config/FirebaseConfig';
import uuidv4 from '../../lib/utils/uuidv4';

@Injectable()
export class FirebaseService {
  async uploadFile(file: Express.Multer.File, path: string) {
    const name = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.')[1];
    const fileName = `${name}-${uuidv4()}.${fileExtension}`;
    const storage = getStorage(initializeFirebaseApp(firebaseConfig));
    const fileRef = ref(storage, `${path}/${fileName}`);
    const metaData = {
      contentType: 'image/jpg',
    };

    const uploaded = await uploadBytesResumable(fileRef, file.buffer, metaData);

    return `https://firebasestorage.googleapis.com/v0/b/hamro-sewa-b7400.appspot.com/o/${path}%2F${uploaded.metadata.name}?alt=media&token=df252cfc-3772-442d-9194-481cf6745882`;
  }
}
