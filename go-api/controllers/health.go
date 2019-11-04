package controllers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
)

type HealthController struct{}

func (h HealthController) Status(c *gin.Context) {
	client := elasticsearch.GetDB()
	_, err := client.CatHealth().Do(context.Background())
	if err != nil {
		DbErr(c)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    nil,
		"message": "Elasticsearch up!",
		"error":   nil,
	})
	return
}
