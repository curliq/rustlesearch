package server

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/controllers"
	"github.com/johnpyp/rustlesearch/go-api/middleware"
	"github.com/johnpyp/rustlesearch/go-api/validation"
)

func NewRouter() *gin.Engine {
	c := config.GetConfig()
	binding.Validator = new(validation.DefaultValidator)
	if c.GetString("env") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(gin.Recovery())
	health := new(controllers.HealthController)
	search := new(controllers.SearchController)
	surrounds := new(controllers.SurroundsController)

	r.GET("/health", health.Status)
	r.GET("/search", search.Retrieve)
	r.GET("/surrounds", surrounds.Retrieve)
	r.StaticFile("/channels.json", c.GetString("paths.channels"))

	return r

}
