package server

import "github.com/johnpyp/rustlesearch/go-api/handlers"

type (
	Server struct {
		*Options
	}

	Options struct {
		Environment         string
		SearchController    handlers.SearchController
		SurroundsController handlers.SurroundsController
		Port                int
	}
)
