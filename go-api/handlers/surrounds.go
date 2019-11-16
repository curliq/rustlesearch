package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/johnpyp/rustlesearch/go-api/services"
)

type SurroundsController struct {
}

func (s SurroundsController) Retrieve(c *gin.Context) {

	var query models.SurroundsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"error":   "SurroundsInputError",
			"message": err.Error(),
		})
		return
	}

	result, err := services.DoSurroundsQuery(query)
	if err != nil {

		c.JSON(http.StatusOK, gin.H{
			"data":    nil,
			"message": "SurroundsError",
			"error":   err,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    result,
		"message": "Surrounds request succeeded",
		"error":   nil,
	})
	return
}
