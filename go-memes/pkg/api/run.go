package api

import (
	"github.com/gin-gonic/gin"
)

func Run() {
	r := gin.Default()

	registerChannelRoutes(r.Group("/"))
	registerChannelRoutes(r.Group("/"))
	r.Run()
}
