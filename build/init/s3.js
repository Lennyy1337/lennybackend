"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const storage_1 = require("@veltahq/storage");
exports.s3 = new storage_1.Storage({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    },
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
});
exports.default = exports.s3;
