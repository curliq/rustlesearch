package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/johnpyp/rustlesearch/go-api/requests"
	"net/http"
)

type SearchController struct{}

var searchModel = new(models.Search)

func (s SearchController) Retrieve(c *gin.Context) {
	var query requests.Search
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "message": "Search validation failed"})
		return
	}

	channelMissing := len(query.Channel) == 0
	usernameMissing := len(query.Username) == 0
	textMissing := len(query.Text) == 0

	if channelMissing && usernameMissing && textMissing {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "At least one of channel, username, or text are required.",
			"message": "Search validation failed",
		})
		return
	}
	results, err := searchModel.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": results, "message": "Search success"})
	return
}
