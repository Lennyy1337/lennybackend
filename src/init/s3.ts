import { Storage } from "@veltahq/storage";

export const s3 = new Storage({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_ACCESS_SECRET_KEY as string,
    },
    forcePathStyle: true,
    region: process.env.S3_REGION as string,
    bucket: process.env.S3_BUCKET as string,
});

export default s3