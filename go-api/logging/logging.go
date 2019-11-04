package logging

import (
	"os"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/rs/zerolog"
)

var logger zerolog.Logger

func Init() error {
	c := config.GetConfig()
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if c.GetString("log.level") == "debug" {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	if c.GetString("log.level") == "warn" {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	logger = zerolog.
		New(os.Stdout).
		With().
		Logger()
	return nil
}

func GetLogger() zerolog.Logger {
	return logger
}
