FROM node:22-alpine as build

WORKDIR /app
COPY ./frontend .
RUN npm ci
RUN npm run build

# 2단계: Serve with nginx
FROM nginx:alpine

# Nginx 설정이 필요하면 여기에 custom.conf COPY 가능
COPY --from=build /app/dist /usr/share/nginx/html
