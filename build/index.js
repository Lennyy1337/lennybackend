"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = require("./init/fastify");
const router_1 = require("./router");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const prisma_1 = require("./init/prisma");
const axios_1 = __importDefault(require("axios"));
const util_1 = __importDefault(require("util"));
const stream_1 = require("stream");
const pipelineAsync = util_1.default.promisify(stream_1.pipeline);
dotenv_1.default.config();
if (!fs_1.default.existsSync("uploads")) {
    fs_1.default.mkdirSync("uploads");
}
fastify_1.fastify.register(rate_limit_1.default, {
    max: 10,
    ban: 3,
    timeWindow: "1 minute",
});
(0, router_1.router)();
fastify_1.fastify.register(static_1.default, {
    root: path.join(__dirname, "../uploads"),
    prefix: "/uploads",
});
fastify_1.fastify.get("/uploads/:filekey", function (req, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const { filekey } = req.params;
        const filextension = filekey.split(".").pop();
        if (filextension == "sxcu") {
            yield reply.download(filekey);
            fs_1.default.rmSync(`uploads/${filekey}`);
            return;
        }
        const signedUrl = yield prisma_1.prisma.upload.findUnique({
            where: {
                fileKey: filekey
            }
        });
        if (!signedUrl) {
            reply.code(404).send({ success: false, message: "no file found" });
            return;
        }
        const response = yield axios_1.default.get(signedUrl.signedUrl, {
            responseType: 'stream',
        });
        const headers = response.headers;
        reply.raw.writeHead(response.status, headers);
        yield pipelineAsync(response.data, reply.raw);
    });
});
fastify_1.fastify.get("/", function (req, reply) {
    reply.redirect("https://lenny.host");
});
fastify_1.fastify.register(multipart_1.default, {
    limits: {
        fileSize: 524288000,
    },
});
fastify_1.fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    console.log(`LennyHost Listening on ${address}`);
    if (err) {
        fastify_1.fastify.log.error(err);
        process.exit(1);
    }
});
