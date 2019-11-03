package models

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/requests"
	"github.com/olivere/elastic/v7"
	"log"
	"time"
)

type Search struct {
}

type Message struct {
	Channel     string    `json:"channel"`
	Text        string    `json:"text"`
	Timestamp   time.Time `json:"ts"`
	Username    string    `json:"username"`
	SearchAfter int       `json:"searchAfter"`
}

func (s *Search) Query(q requests.Search) ([]Message, error) {
	c := config.GetConfig()
	client := db.GetDB()
	query := queryBuilder(q)
	searchResult, err := client.Search().
		Query(query).
		Size(c.GetInt("elastic.size")).
		Sort("ts", false).
		Do(context.Background())
	if err != nil {
		log.Print("First: ", err)
		return []Message{}, err
	}
	results := []Message{}
	if searchResult.TotalHits() > 0 {
		fmt.Printf("Found a total of %d tweets\n", searchResult.TotalHits())

		// Iterate through results
		for _, hit := range searchResult.Hits.Hits {
			// hit.Index contains the name of the index

			// Deserialize hit.Source into a Tweet (could also be just a map[string]interface{}).
			var t Message

			err := json.Unmarshal(hit.Source, &t)
			if err != nil {
				log.Print(err)
			}
			t.SearchAfter = int(hit.Sort[0].(float64))
			results = append(results, t)
			// Work with tweet
		}
	} else {
		// No hits
		fmt.Print("Found no tweets\n")
	}

	return results, nil
}

func queryBuilder(q requests.Search) elastic.Query {
	query := elastic.NewBoolQuery()
	if len(q.Channel) != 0 {
		query = query.Filter(elastic.NewTermQuery("channel", q.Channel))
	}
	if len(q.Username) != 0 {
		query = query.Filter(elastic.NewTermQuery("username", q.Username))
	}
	if len(q.Text) != 0 {
		query = query.Filter(elastic.NewMatchQuery("text", q.Text).Operator("and"))
	}
	var rangeQuery = elastic.NewRangeQuery("ts")
	if !q.StartDate.IsZero() {
		rangeQuery = rangeQuery.From(q.StartDate)
	}
	if !q.EndDate.IsZero() {
		rangeQuery = rangeQuery.To(q.EndDate)
	}

	query = query.Filter(rangeQuery)

	return query
}
