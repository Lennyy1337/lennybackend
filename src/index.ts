import dotenv from "dotenv";
import { fastify } from "./init/fastify";
import { router } from "./router";

import multipart from "@fastify/multipart";

import fastifyStatic from "@fastify/static";

import * as path from "path";
import fs from "fs";

import ratelimit from "@fastify/rate-limit";
import { prisma } from "./init/prisma";
import axios from "axios";

import util from 'util';
import { pipeline } from 'stream';
const pipelineAsync = util.promisify(pipeline);

dotenv.config();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

fastify.register(ratelimit, {
  max: 10,
  ban: 3,
  timeWindow: "1 minute",
});

router();

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../uploads"),
  prefix: "/uploads",
});


fastify.get("/uploads/:filekey", async function (req, reply) {
  const { filekey } = req.params as any;

  const filextension = filekey.split(".").pop();
  if (filextension == "sxcu") {
      await reply.download(filekey);
      fs.rmSync(`uploads/${filekey}`);
      return;
  }

  const fileRecord = await prisma.upload.findUnique({
      where: {
          fileKey: filekey,
      },
  });

  if (!fileRecord) {
      reply.code(404).send({ success: false, message: "No file found" });
      return;
  }

  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filekey}`;

  try {
      const response = await axios.get(publicUrl, {
          responseType: "stream",
      });

      const headers = response.headers as Record<string, any>;
      reply.raw.writeHead(response.status, headers);

      await pipelineAsync(response.data, reply.raw);
  } catch (error) {
      console.error("Error streaming file:", error);
      reply.code(500).send({ success: false, message: "Failed to stream file" });
  }
});

fastify.get("/", function (req, reply) {
  //reply.redirect("https://lenny.host");
  reply.send("works")
});

fastify.register(multipart, {
  limits: {
    fileSize: 524288000,
  },
});

fastify.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
  console.log(`LennyHost Listening on ${address}`);
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
