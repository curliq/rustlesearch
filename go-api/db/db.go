package db

import (
	// "github.com/imroc/req"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/olivere/elastic/v7"
	"log"
)

var db *elastic.Client

func Init() {
	var err error
	c := config.GetConfig()
	db, err = elastic.NewClient(
		elastic.SetURL(c.GetString("elastic.url")),
		elastic.SetSniff(false),
	)
	if err != nil {
		log.Fatal("Error creating elastic client: ", err)
	}
}

func GetDB() *elastic.Client {
	return db
}
