FROM golang:1.13 AS build

RUN mkdir -p /workspace/app /workspace/data

COPY . /workspace/app
WORKDIR /workspace/app

RUN go build

CMD ["/workspace/app/go-api"]
