FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       git \
       golang-go \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /gotlucky

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o server .

EXPOSE 8080

ENTRYPOINT ["./server"]
