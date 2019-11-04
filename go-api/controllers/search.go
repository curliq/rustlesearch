package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/johnpyp/rustlesearch/go-api/requests"
)

type SearchController struct{}

var searchModel = new(models.Search)

func (s SearchController) Retrieve(c *gin.Context) {
	var query requests.Search
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"error":   "SearchInputError",
			"message": err.Error(),
		})
		return
	}

	channelMissing := len(query.Channel) == 0
	usernameMissing := len(query.Username) == 0
	textMissing := len(query.Text) == 0

	if channelMissing && usernameMissing && textMissing {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"message": "At least one field: channel, username, or text are required.",
			"error":   "SearchInputError",
		})
		return
	}

	results, err := searchModel.Query(query)
	if err != nil {
		DbErr(c)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    results,
		"message": "Search request succeeded",
		"error":   nil,
	})
	return
}
