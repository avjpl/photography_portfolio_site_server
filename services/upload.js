import Minio from 'minio';

import { encode } from '../utils/index.js';

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

export const minioUpload = async ({ filename, stream }) => {
  const bucketExists = await minioClient.bucketExists(bucket);

  !bucketExists && (await minioClient.makeBucket(bucket, region));
  !bucketExists && minioClient.setBucketPolicy(bucket, policy);

  const { id, image_uri, encodedFilname } = encode({ bucket, filename });

  try {
    await minioClient.putObject(bucket, encodedFilname, stream);
  } catch (e) {
    console.error(e);
  }

  return { filename: image_uri, id };
};

/*
export const getFiles = () => {
  const stream = minioClient.listObjectsV2(bucket, '', true, '');

  return new Promise((resolve, reject) => {
    let files = [];

    stream.on('data', (obj) => {
      files.push(obj);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      files = files.map((file) => ({
        ...file,
        filename: file.name,
      }));

      resolve(files);
    });
  });
};
*/
