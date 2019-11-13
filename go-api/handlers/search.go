package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/johnpyp/rustlesearch/go-api/services"
)

type SearchController struct {
}

func (s SearchController) Retrieve(c *gin.Context) {
	var query models.SearchQuery
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

	results, err := services.DoSearchQuery(query)
	if err != nil {
		DbErr(c)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    results,
		"message": "SearchQuery request succeeded",
		"error":   nil,
	})
	return
}
