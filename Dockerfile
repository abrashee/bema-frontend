# Build stage
FROM node:22.23.1-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


# Runtime stage
FROM nginx:1.31.2-alpine@sha256:54f2a904c251d5a34adf545a72d32515a15e08418dae0266e23be2e18c66fefa

RUN apk upgrade --no-cache c-ares libexpat \
    && apk del --no-cache curl libcurl

COPY --chown=nginx:nginx --from=build /app/dist/bema-frontend/browser/ /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx \
        /var/cache/nginx \
        /var/run/nginx.pid \
        /usr/share/nginx/html \
        /etc/nginx/conf.d

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
