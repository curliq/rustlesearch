package main

import (
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/server"
	_ "github.com/joho/godotenv/autoload"
	"log"
)

func init() {
	err := config.Init()
	err = logging.Init()
	err = elasticsearch.Init()
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	config := config.GetConfig()

	options := server.Options{
		Environment: config.GetString("env"),
		Port:        config.GetInt("server.port"),
	}

	s := server.Server{
		Options: &options,
	}

	err := s.Start()
	if err != nil {
		log.Fatal(err)
	}
}
