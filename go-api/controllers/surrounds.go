package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/johnpyp/rustlesearch/go-api/requests"
)

type SurroundsController struct{}

var surroundsModel = new(models.Surrounds)

func (s SurroundsController) Retrieve(c *gin.Context) {
	var query requests.Surrounds
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"error":   "SurroundsInputError",
			"message": err.Error(),
		})
		return
	}

	results, err := surroundsModel.Query(query)
	if err != nil {
		DbErr(c)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    results,
		"message": "Surrounds request succeeded",
		"error":   nil,
	})
	return
}
