FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm cache clean --force

RUN npm install -g typescript prisma 

RUN cd node_modules/bcrypt

RUN node-pre-gyp install --fallback-to-build

RUN cd ../..

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
