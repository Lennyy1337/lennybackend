import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { prisma } from "../init/prisma";
import { jwt } from "../init/jwt";
import s3 from "../init/s3";
import { upload } from "@prisma/client";

function bufferToStream(binary: any) {
    return new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
}

interface file {
  id: string;
  mimetype: string;
  fileKey: string;
  fileName: string;
  userId: string;
  signedUrl: string;
}

export default class fileManager {
  declare filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async getFile(fileKey: string): Promise<string | null> {
    try {
      const fileRecord = await prisma.upload.findUnique({
        where: {
          fileKey: fileKey,
        },
        select: {
          signedUrl: true,
        },
      });

      if (!fileRecord) {
        return null;
      }

      return fileRecord.signedUrl;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  }

  async uploadFile(
    fileStream: Readable,
    originalFileName: string,
    contentType: string,
    userId: string
  ): Promise<upload> {
    const fileExtension = path.extname(originalFileName);
    const fileKey = uuidv4() + fileExtension;

    return new Promise<upload>((resolve, reject) => {
      const chunks: Buffer[] = [];
      fileStream.on("data", (chunk) => {
        chunks.push(chunk);
      });
      fileStream.on("end", async () => {
        const fileData = Buffer.concat(chunks);
        try {
          const stream = bufferToStream(fileData)

          await s3.uploadObject(fileKey, stream as any, contentType);
          const signedUrl = await s3.getSignedUrl(fileKey);

          const upload = await prisma.upload.create({
            data: {
              fileKey: fileKey,
              fileName: originalFileName,
              userId: userId,
              mimetype: contentType,
              signedUrl: signedUrl,
            },
          });

          resolve(upload);
        } catch (err) {
          reject(err);
        }
      });
      fileStream.on("error", (err) => {
        reject(err);
      });
    });
  }

  async getUserFiles(jwtToken: string): Promise<file[] | null> {
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
