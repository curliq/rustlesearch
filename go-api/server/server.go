package server

import (
	"fmt"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/robfig/cron/v3"
	"io/ioutil"
	"net/http"
)

func (s Server) Start() error {

	log := logging.GetLogger()
	updateChannels()
	c := cron.New()
	c.AddFunc("@hourly", updateChannels)
	c.Start()

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

func updateChannels() {
	log := logging.GetLogger()
	resp, err := http.Get("https://overrustlelogs.net/api/v1/channels.json")
	if err != nil {
		log.Error().Caller().Err(err).Msg("http error in updateChannels")
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error().Caller().Err(err).Msg("body read error in updateChannels")
		return
	}
	err = ioutil.WriteFile("channels.json", body, 0644)
	if err != nil {
		log.Error().Caller().Err(err).Msg("file write error in updateChannels")
		return
	}

	log.Debug().Msg("updateChannels successful")
}
