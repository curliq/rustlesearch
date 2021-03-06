package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/handlers"
	"github.com/johnpyp/rustlesearch/go-api/middleware"
	"github.com/johnpyp/rustlesearch/go-api/validation"
)

func NewRouter(options Options) *gin.Engine {
	binding.Validator = new(validation.DefaultValidator)
	if options.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.Default())
	r.GET("/health", handlers.HealthController{}.Status)
	r.GET("/search", handlers.SearchController{}.Retrieve)
	r.GET("/surrounds", handlers.SurroundsController{}.Retrieve)

	c := config.GetConfig() // Not sure what this is, exercise for you is to lift this up.
	r.StaticFile("/channels.txt", c.GetString("paths.channels"))

	return r
}
