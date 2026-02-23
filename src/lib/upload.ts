/**
 * Configuration de Multer pour le téléchargement de fichiers.
 * Gère le stockage, le nommage et la validation (ex: filtrage des PDF).
 */
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/cv');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
