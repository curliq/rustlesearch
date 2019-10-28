package api

import (
	"github.com/gin-gonic/gin"
)

func routes(r *gin.RouterGroup) {

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
}
