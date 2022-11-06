import { createWriteStream, unlinkSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const uploadDir = process.env.uploadFolder || 'uploads';

// TODO: create folder if is doesn't exist

export const fileUpload = ({ filename, stream }) => {
  const filePath = path.resolve(uploadDir, filename);

  return new Promise((resolve, reject) =>
    stream
      .on('error', (error) => {
        if (stream.truncated) unlinkSync(filePath);
        reject(error);
      })
      .pipe(createWriteStream(filePath))
      .on('error', (error) => reject(error))
      .on('finish', () => {
        resolve({
          sourceFile: `${uploadDir}/${filename}`,
        });
      }),
  );
};
