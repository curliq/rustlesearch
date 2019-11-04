FROM golang:1.13

WORKDIR /app
COPY . .

RUN go build

FROM scratch

WORKDIR /app

COPY --from=build /app/go-api .
CMD ["/app/go-api"]
