FROM golang:1.24.2 AS builder

WORKDIR /app
COPY ./backend .
RUN go mod download
RUN go build -o server ./cmd/main.go


FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
  apt-get install -y --no-install-recommends ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /gotlucky

COPY --from=builder /app/server ./

EXPOSE 8080

ENTRYPOINT ["./server"]