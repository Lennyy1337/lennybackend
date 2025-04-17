"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const stream_1 = require("stream");
const prisma_1 = require("../init/prisma");
const jwt_1 = require("../init/jwt");
const s3_1 = __importDefault(require("../init/s3"));
function bufferToStream(binary) {
    return new stream_1.Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
}
class fileManager {
    constructor(filepath) {
        this.filepath = filepath;
    }
    getFile(fileKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileRecord = yield prisma_1.prisma.upload.findUnique({
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
            }
            catch (error) {
                console.error("Error fetching file URL:", error);
                return null;
            }
        });
    }
    uploadFile(fileStream, originalFileName, contentType, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExtension = path_1.default.extname(originalFileName);
            const fileKey = (0, uuid_1.v4)() + fileExtension;
            return new Promise((resolve, reject) => {
                const chunks = [];
                fileStream.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                fileStream.on("end", () => __awaiter(this, void 0, void 0, function* () {
                    const fileData = Buffer.concat(chunks);
                    try {
                        const stream = bufferToStream(fileData);
                        yield s3_1.default.uploadObject(fileKey, stream, contentType);
                        const signedUrl = yield s3_1.default.getSignedUrl(fileKey);
                        const upload = yield prisma_1.prisma.upload.create({
                            data: {
                                fileKey: fileKey,
                                fileName: originalFileName,
                                userId: userId,
                                mimetype: contentType,
                                signedUrl: signedUrl,
                            },
                        });
                        resolve(upload);
                    }
                    catch (err) {
                        reject(err);
                    }
                }));
                fileStream.on("error", (err) => {
                    reject(err);
                });
            });
        });
    }
    getUserFiles(jwtToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield jwt_1.jwt.getUserFromJWT(jwtToken);
            if (!user) {
                return null;
            }
            const files = yield prisma_1.prisma.upload.findMany({
                where: {
                    userId: user.id,
                },
            });
            return files;
        });
    }
}
exports.default = fileManager;
