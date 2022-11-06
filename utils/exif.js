import camelcase from 'camelcase';
import { join } from 'path';
import os from 'node:os';
import { nanoid } from 'nanoid';
import { spawn } from 'node:child_process';
import { writeFile, unlink, mkdtemp } from 'node:fs/promises'

const save = async (buffer) => {
  const tmpDir = await mkdtemp(join(os.tmpdir()));
  const filePath = `${tmpDir}/${nanoid()}.jpg`;

  try {
    await writeFile(filePath, Buffer.from(buffer));
  } catch (err) {
    console.error(err.message);
  }

  return {
    delete: async () => await unlink(filePath),
    filePath,
  };
}

const keysToCamelcase = (data) =>
  Object.entries(data).reduce((a, cur) => {
    const [k, v] = cur;
    a[camelcase(k)] = v;
    return a;
  }, {});

export const exif = async (buffer) => {
  return new Promise(async(resolve, reject) => {
    const file = await save(buffer);
    const exifTool = spawn('exiftool', [
      '-Aperture',
      '-ApertureValue',
      '-Compression',
      '-ExposureMode',
      '-ExposureProgram',
      '-ExposureTime',
      '-FileType',
      '-FileTypeExtension',
      '-Flash',
      '-FlashCompensation',
      '-FNumber',
      '-FocalLength',
      '-ImageHeight',
      '-ImageSize',
      '-ImageWidth',
      '-ISO',
      '-LensModel',
      '-Lens',
      '-LensID',
      '-LensInfo',
      '-Make',
      '-Megapixels',
      '-MimeType',
      '-Model',
      '-ShutterSpeed',
      '-ShutterSpeedValue',
      '-Software',
      '-WhiteBalance',
      '-json',
      file.filePath
    ]);

    exifTool.stdout.on('data', (data) => {
      const exif = JSON.stringify(keysToCamelcase(JSON.parse(data)[0]));
      resolve(exif);
    });

    exifTool.stderr.on('data', (data) => {
      reject(data);
    });

    exifTool.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    // setTimeout(async() => await file.delete(), 10000);
  });
};
