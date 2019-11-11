package server

import (
	"fmt"
	"log"

	"github.com/johnpyp/rustlesearch/go-api/handlers"
	"github.com/johnpyp/rustlesearch/go-api/rustlesearch"
)

func (s Server) Start() error {
	// Initialise with default values if server options not set
	options := Options{
		Environment: "development",
		SearchController: handlers.SearchController{
			Search: rustlesearch.Search{},
		},
		SurroundsController: handlers.SurroundsController{
			Surrounds: rustlesearch.Surrounds{},
		},
		Port: 3000,
	}
	if s.Options != nil {
		options = *s.Options
	} else {
		log.Println("Starting with server defaults, no configuration set.")
	}
	return NewRouter(options).Run(fmt.Sprintf(":%d", options.Port))
}
