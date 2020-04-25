package server

import (
	"fmt"
	"github.com/johnpyp/rustlesearch/go-api/logging"
)

func (s Server) Start() error {

	log := logging.GetLogger()

	// Initialise with default values if server options not set
	options := Options{
		Environment: "development",
		Port:        3000,
	}
	if s.Options != nil {
		options = *s.Options
	} else {
		log.Info().Msg("Starting with server defaults, no configuration set.")
	}
	return NewRouter(options).Run(fmt.Sprintf(":%d", options.Port))
}
