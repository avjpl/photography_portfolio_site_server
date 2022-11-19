import createHmac from 'create-hmac';
import dotenv from "dotenv";

dotenv.config();

// TODO: Move to .env file
const KEY =
  '3607897725224f626ccfc891dbedb4ee4b7ced473f5b10c1c0c788f9601753b042fcdfdeae27b4c5e7b959bd986f88da09ece4df5babf2e63a9838598c9cfe24';
const SALT =
  '9ecbf7211ee0ecb5d656b303e041ece6d32708d555d02512f263f95f599aea18dd7a1d73a3fde683113bcd691a527ec59357c313cc46c14993a92d8bc5405937';

export const urlSafeBase64 = (string) => {
  return Buffer.from(string)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const hexDecode = (hex) => Buffer.from(hex, 'hex');

const sign = (salt, target, secret) => {
  const hmac = createHmac('sha256', hexDecode(secret));
  hmac.update(hexDecode(salt));
  hmac.update(target);
  return urlSafeBase64(hmac.digest());
};

// TODO: specify file sizes & formats

export const encode = ({ bucket, filename, width }) => {
  const url = `s3://${bucket}/${filename}`;
  const resizing_type = 'fill';
  const height = 0;
  const gravity = 'no';
  const enlarge = 1;
  const extension = '.jpg';
  const encoded_url = urlSafeBase64(url);
  const path = `/rs:${resizing_type}:${width}:${height}:${enlarge}/g:${gravity}/${encoded_url}${extension}`;

  const signature = sign(SALT, path, KEY);

  return {
    id: signature,
    filename,
    src: `/${signature}${path}`,
  };
};

