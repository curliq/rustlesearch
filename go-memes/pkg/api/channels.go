package api

import (
	"github.com/gin-gonic/gin"
)

func registerChannelRoutes(r *gin.RouterGroup) {
	r.GET("/channels", getChannels)

}

func getChannels(c *gin.Context) {

}
