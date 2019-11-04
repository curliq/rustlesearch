package db

import (
	"log"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/olivere/elastic/v7"
)

var db *elastic.Client

func Init() {
	var err error
	c := config.GetConfig()
	db, err = elastic.NewClient(
		elastic.SetURL(c.GetString("elastic.url")),
		elastic.SetSniff(false),
		elastic.SetHealthcheck(false),
	)
	if err != nil {
		log.Print("Error creating elastic client: ", err)
	}
}

func GetDB() *elastic.Client {
	return db
}
