package main

import (
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/controllers"
	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/rustlesearch"
	"github.com/johnpyp/rustlesearch/go-api/server"
	_ "github.com/joho/godotenv/autoload"
	"github.com/spf13/viper"
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
	env := viper.GetString("env")

	options := server.Options{
		Environment: server.Environment(env),
		SearchController: controllers.SearchController{
			Search: rustlesearch.Search{},
		},
		SurroundsController: controllers.SurroundsController{
			Surrounds: rustlesearch.Surrounds{},
		},
	}

	s := server.Server{
		Options: &options,
	}

	err := s.Start()
	if err != nil {
		log.Fatal(err)
	}
}
