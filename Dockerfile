FROM node:22.14.0 AS build

WORKDIR /app

COPY package.json .

RUN npm install

# Docker Container 워킹 디렉토리에 모든파일 복사
COPY . .

# PORT 8081 명시
EXPOSE 8081

#CMD ["npm", "run", "serve"]
#CMD ["npm", "run", "dev-serve"]
CMD ["npm", "run", "docker-serve"]