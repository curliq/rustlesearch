package server

import (
	"fmt"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/controllers"
	"github.com/johnpyp/rustlesearch/go-api/rustlesearch"
	"log"
)

func (s Server) Start() error {
	// Initialise with default values if server options not set
	options := Options{
		Environment: "local",
		SearchController: controllers.SearchController{
			Search: rustlesearch.Search{},
		},
		SurroundsController: controllers.SurroundsController{
			Surrounds: rustlesearch.Surrounds{},
		},
	}
	if s.Options != nil {
		options = *s.Options
	} else {
		log.Println("Starting with server defaults, no configuration set.")
	}
	return NewRouter(options).Run(fmt.Sprintf(":%s", config.GetConfig().GetString("server.port")))
}
