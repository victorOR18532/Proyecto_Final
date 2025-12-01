# --- Primera etapa: build con Node ---
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Segunda etapa: servir con NGINX ---
FROM nginx:alpine

# Borrar default
RUN rm -rf /usr/share/nginx/html/*

# Copiar build final
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto del contenedor
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
