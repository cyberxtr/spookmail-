FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-timeout 60000

RUN npm install -g npm@latest

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 5000

CMD ["npm", "run", "dev"]
