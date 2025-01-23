import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_ACCESS_SECRET_KEY as string,
    },
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    forcePathStyle: true,
});

export default s3;