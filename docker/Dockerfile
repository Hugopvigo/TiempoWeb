FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY web/package.json ./web/

RUN npm ci

COPY shared/ ./shared/
COPY web/ ./web/

ARG VITE_OWM_API_KEY=""
ARG VITE_AEMET_API_KEY=""
ENV VITE_OWM_API_KEY=$VITE_OWM_API_KEY
ENV VITE_AEMET_API_KEY=$VITE_AEMET_API_KEY

RUN npm run build -w web

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/web/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
