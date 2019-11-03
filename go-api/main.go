package main

import (
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/server"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	config.Init()
	db.Init()
	server.Init()
}
