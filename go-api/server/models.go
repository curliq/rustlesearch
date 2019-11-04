package server

import "github.com/johnpyp/rustlesearch/go-api/controllers"

const (
	Production Environment = "production"
)

type (
	Environment string

	Server struct {
		*Options
	}

	Options struct {
		Environment         Environment
		SearchController    controllers.SearchController
		SurroundsController controllers.SurroundsController
	}
)
