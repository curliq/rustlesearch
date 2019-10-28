package api

import (
	"github.com/gin-gonic/gin"
)

func registerSearchRoutes(r *gin.RouterGroup) {
	r.GET("/search", getChannels)

}

func searchQueryBuilder(c *gin.Context) {
}
