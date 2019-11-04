package server

import "github.com/johnpyp/rustlesearch/go-api/controllers"

type (
	Server struct {
		*Options
	}

	Options struct {
		Environment         string
		SearchController    controllers.SearchController
		SurroundsController controllers.SurroundsController
		Port                int
	}
)
