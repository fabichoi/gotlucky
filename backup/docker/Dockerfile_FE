# 1단계: Node로 frontend 빌드
FROM node:22-alpine as build

WORKDIR /app
COPY ./frontend .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm ci
RUN npm run build

# 2단계: Nginx로 정적 파일 서빙
FROM nginx:stable-alpine

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 nginx 설정 복사 (SPA fallback, gzip 적용)
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 오픈
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]