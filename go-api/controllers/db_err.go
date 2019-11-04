package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func DbErr(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{
		"data":    nil,
		"message": "Elasticsearch database unavailable, try again soon.",
		"error":   "DatabaseError",
	})

}
