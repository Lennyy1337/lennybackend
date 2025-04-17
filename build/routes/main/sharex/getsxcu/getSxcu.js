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
exports.getSxcuRoute = getSxcuRoute;
const fastify_1 = require("../../../../init/fastify");
const jwt_1 = require("../../../../init/jwt");
const fs_1 = __importDefault(require("fs"));
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const uuid = new short_unique_id_1.default({ length: 4 });
function generateSxcu(jwt, domain) {
    const sxcuTemplate = `{
      "Version": "16.0.1",
      "Name": "Lenny.host (${domain})",
      "DestinationType": "ImageUploader",
      "RequestMethod": "POST",
      "RequestURL": "https://${domain}/upload",
      "Headers": {
        "authorization": "${jwt}"
      },
      "Body": "MultipartFormData",
      "FileFormName": "file",
      "URL": "https://${domain}/uploads/{json:data}"
    }`;
    return sxcuTemplate;
}
function getSxcuRoute() {
    return __awaiter(this, void 0, void 0, function* () {
        fastify_1.fastify.post("/sharex/getsxcu", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!request.body) {
                        reply
                            .code(400)
                            .send({ success: false, message: "This route requires a JSON body" });
                        return;
                    }
                    const { authorization } = request.headers;
                    const { domain } = request.body;
                    if (!authorization) {
                        reply.code(403).send({ success: false, message: "No authorization" });
                        return;
                    }
                    const user = yield jwt_1.jwt.getUserFromJWT(authorization);
                    if (!user) {
                        reply.send({ success: false, message: "Invalid authorization" });
                    }
                    const newToken = yield jwt_1.jwt.signToken(user, "600d");
                    const sxcu = generateSxcu(newToken, domain);
                    const filename = `${domain}.${uuid.randomUUID()}.sxcu`;
                    const path = `uploads/${filename}`;
                    const file = yield fs_1.default.promises.writeFile(path, sxcu);
                    console.log("wtf");
                    reply.send({
                        success: true,
                        message: "Success",
                        data: `/uploads/${filename}`,
                    });
                }
                catch (e) {
                    if (e.message.includes("is not allowed")) {
                        reply
                            .code(400)
                            .send({ success: false, message: "File type is not allowed." });
                        return;
                    }
                    reply
                        .code(500)
                        .send({ success: false, message: "Internal Server Error." });
                    console.log("Error in sharexsxcu;");
                    console.log(e);
                }
            });
        });
    });
}
