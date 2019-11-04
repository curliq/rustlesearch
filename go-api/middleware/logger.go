package middleware

import (
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/logging"
)

func Logger() gin.HandlerFunc {
	log := logging.GetLogger()
	return logger.SetLogger(logger.Config{

		Logger:   &log,
		UTC:      true,
		SkipPath: []string{"/skip"},
	})
}
