package server

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/controllers"
	"github.com/johnpyp/rustlesearch/go-api/validation"
)

func NewRouter() *gin.Engine {
	c := config.GetConfig()
	binding.Validator = new(validation.DefaultValidator)

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	health := new(controllers.HealthController)
	search := new(controllers.SearchController)
	r.GET("/health", health.Status)
	r.GET("/search", search.Retrieve)
	r.StaticFile("channels.json", c.GetString("paths.channels"))

	return r

}
