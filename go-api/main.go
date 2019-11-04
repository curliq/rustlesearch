package main

import (
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/server"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	config.Init()
	logging.Init()
	db.Init()
	server.Init()
}
