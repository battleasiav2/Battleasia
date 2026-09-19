import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

function hmac(key, data) {
  return createHmac('sha256', key).update(data).digest();
}

function sha256Hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

export async function putBackupObject(filePath, objectKey) {
  const endpoint = (process.env.BACKUP_S3_ENDPOINT || '').replace(/\/$/, '');
  const bucket = process.env.BACKUP_S3_BUCKET || '';
  const accessKey = process.env.BACKUP_S3_ACCESS_KEY || '';
  const secretKey = process.env.BACKUP_S3_SECRET || '';
  const region = process.env.BACKUP_S3_REGION || 'auto';
  if (!endpoint || !bucket || !accessKey || !secretKey) return false;

  const body = readFileSync(filePath);
  const url = new URL(`${endpoint}/${bucket}/${objectKey.split('/').map(encodeURIComponent).join('/')}`);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = ['PUT', url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Content-Type': 'application/octet-stream',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`S3 PUT ${res.status} ${text.slice(0, 240)}`);
  }
  return true;
}
