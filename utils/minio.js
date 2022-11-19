import Minio from 'minio';
import dotenv from "dotenv";
import sizeOf from 'image-size';
import url from 'url';
import http from 'http';

import { encode, exif, urlSafeBase64 } from './index.js';

dotenv.config();

// TODO: Move credentials to .env file also place client on the datasource object
const minioClient = new Minio.Client({
  endPoint: '127.0.0.1', // .env
  port: 9000, // .env
  useSSL: false,
  accessKey: 'avjpl',
  secretKey: 'jj010479',
});

const bucket = 'photos';
const region = 'us-east-1';
const policy = `
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads"
            ],
            "Resource": [
                "arn:aws:s3:::photos"
            ]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:ListMultipartUploadParts",
                "s3:PutObject",
                "s3:AbortMultipartUpload",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:GetBucketNotification",
                "s3:GetBucketTagging",
                "s3:GetBucketVersioning",
                "s3:GetObjectTagging",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::photos/*"
            ]
        }
    ]
}
`;

const sizes = [600, 640, 750, 828, 1080, 1200, 1920, 2048, 3840, 0];

const stream2buffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const _buf = [];

    stream.on('data', (chunk) => {
      _buf.push(chunk)
    });

    stream.on('end', () => {
      resolve(Buffer.concat(_buf));
    });

    stream.on('error', (err) => {
      reject(err)
    });
  });
}

const getImage = (imgUrl) => {
  const options = url.parse(imgUrl)

  return new Promise((resolve, reject) => {
    http.get(options, function (response) {
      const chunks = [];

      response.on('data', function (chunk) {
        chunks.push(chunk);
      })
        .on('end', function() {
          resolve(sizeOf(Buffer.concat(chunks)));
        }).on('error', (e) => {
          reject(e);
        });
    });
  })
};

/*
const tryCatch = async (fn, errObj = {}) => {
  try {
    await fn();
  } catch (e) {
    console.error(e);
  }
}
*/

export const minioUpload = async ({ filename, stream }) => {
  const bucketExists = await minioClient.bucketExists(bucket);

  !bucketExists && (await minioClient.makeBucket(bucket, region));
  !bucketExists && minioClient.setBucketPolicy(bucket, policy);

  const base64Filename = urlSafeBase64(filename);

  try {
    await minioClient.putObject(bucket, base64Filename, stream);
  } catch (e) {
    console.error(e);
  }

  const imageSizes = await Promise.all(sizes.map(async (width) => {
    const { src } = encode({ bucket, filename: base64Filename, width });

    const { orientation, height } = await getImage(`http://localhost:8080${src}`);

    return { height, orientation, src, width };
  }));

  const exifData = await exif(await stream2buffer(await minioClient.getObject(bucket, base64Filename)));

  return {
    filename: base64Filename,
    variants: imageSizes,
    ...(exifData ? { exif: exifData } : {}),
  };
};

export const minioDelete = async ({ filename }) => {
  try {
    return await minioClient.removeObject(bucket, filename);
  } catch (e) {
    console.error(e);
  }
};
