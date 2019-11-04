package elasticsearch

import (
	"errors"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/olivere/elastic/v7"
)

var client *elastic.Client

func Init() error {
	var err error
	c := config.GetConfig()
	client, err = elastic.NewClient(
		elastic.SetURL(c.GetString("elastic.url")),
		elastic.SetSniff(false),
		elastic.SetHealthcheck(false),
	)
	if err != nil {
		return errors.New("Error creating elastic client: " + err.Error())
	}
	return nil
}

func GetDB() *elastic.Client {
	return client
}
