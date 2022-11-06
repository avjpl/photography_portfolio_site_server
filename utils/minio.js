import Minio from 'minio';

import { encode, exif, urlSafeBase64 } from './index.js';

// TODO: Move credentials to .env file also place client on the datasource object
const minioClient = new Minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
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

    return { src, width };
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
