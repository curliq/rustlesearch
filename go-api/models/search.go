package models

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/requests"
	"github.com/olivere/elastic/v7"
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
	log := logging.GetLogger()
	client := db.GetDB()
	searchResult, err := searchBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("Search builder error")
		return []Message{}, err
	}
	results := []Message{}
	if searchResult.TotalHits() > 0 {
		log.Debug().Int64("totalHits", searchResult.TotalHits()).Msg("Total hits")

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
		log.Debug().Msg("No hits found")
	}

	return results, nil
}

func searchBuilder(q requests.Search, client *elastic.Client) *elastic.SearchService {
	c := config.GetConfig()
	query := elastic.NewBoolQuery()
	if len(q.Channel) != 0 {
		channel := strings.Title(strings.ToLower(q.Channel))
		query = query.Filter(elastic.NewTermQuery("channel", channel))
	}
	if len(q.Username) != 0 {
		username := strings.ToLower(q.Username)
		query = query.Filter(elastic.NewTermQuery("username", username))
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

	searchQuery := client.Search().
		Query(query).
		Size(c.GetInt("elastic.size")).
		Sort("ts", false)

	if q.SearchAfter != 0 {
		searchQuery = searchQuery.SearchAfter(q.SearchAfter)
	}
	return searchQuery
}
