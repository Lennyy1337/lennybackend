import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { prisma } from "../init/prisma";
import { jwt } from "../init/jwt";
import s3 from "../init/s3";
import { upload } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

function bufferToStream(binary: any) {
  return new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });
}

export default class fileManager {

  async getFile(fileKey: string): Promise<string | null> {
    try {
      const fileRecord = await prisma.upload.findUnique({
        where: {
          fileKey: fileKey,
        },
        select: {
          fileKey: true,
        },
      });

      if (!fileRecord) {
        return null;
      }

      const publicUrl = `http://${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileKey}`;

      return publicUrl;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  }

  async upload(
    key: string,
    body: Readable | Buffer,
    contentType: string
  ): Promise<void> {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
    });
  
    await upload.done();
  }

async uploadFile(
  fileStream: Readable,
  originalFileName: string,
  contentType: string,
  userId: string
): Promise<upload> {
  const fileExtension = path.extname(originalFileName);
  const fileKey = uuidv4() + fileExtension;

  try {
    // Stream directly to S3 without buffering
    await this.upload(fileKey, fileStream, contentType);

    const publicUrl = `https://${process.env.S3_BUCKET}.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;

    return await prisma.upload.create({
      data: {
        fileKey: fileKey,
        fileName: originalFileName,
        userId: userId,
        mimetype: contentType,
      },
    });
  } catch (err) {
    console.error("Error during file upload:", err);
    throw new Error("Failed to upload file to S3");
  }
}

  async getUserFiles(jwtToken: string): Promise<upload[] | null> {
    const user = await jwt.getUserFromJWT(jwtToken);

    if (!user) {
      return null;
    }

    const files = await prisma.upload.findMany({
      where: {
        userId: user.id,
      },
    });

    return files;
  }
}
