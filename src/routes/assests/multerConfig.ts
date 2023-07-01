// multerConfig.ts
import multer from 'multer';

const storage: multer.StorageEngine = multer.memoryStorage();

const multerInstance = multer({ storage });

export default process.env.NODE_ENV === 'test' ? jest.fn() : multerInstance;