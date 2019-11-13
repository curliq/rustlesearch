FROM golang:1.13 AS build

WORKDIR /app
COPY . .

RUN go build

CMD ["/app/go-api"]
