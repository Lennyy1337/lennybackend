FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm cache clean --force

RUN npm install -g typescript prisma 

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
