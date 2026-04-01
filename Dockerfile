FROM node:18

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

# copiar todo el backend
COPY backend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]