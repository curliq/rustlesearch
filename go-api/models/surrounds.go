package models

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/requests"
	"github.com/olivere/elastic/v7"
)

type Surrounds struct {
}

func (s *Surrounds) Query(q requests.Surrounds) ([]Message, error) {
	log := logging.GetLogger()
	client := db.GetDB()
	queryResult, err := surroundsBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("Search builder error")
		return []Message{}, err
	}
	results := []Message{}
	for _, resultItem := range queryResult.Responses {
		if resultItem.TotalHits() > 0 {
			log.Debug().Int64("totalHits", resultItem.TotalHits()).Msg("Total hits")

			// Iterate through results
			for _, hit := range resultItem.Hits.Hits {
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
	}

	return results, nil
}

func surroundsBuilder(q requests.Surrounds, client *elastic.Client) *elastic.MultiSearchService {
	channel := strings.Title(strings.ToLower(q.Channel))
	query := elastic.
		NewBoolQuery().
		Filter(elastic.NewTermQuery("channel", channel))
	q1 := elastic.NewSearchRequest().
		Index("rustlesearch-*").
		Source(elastic.
			NewSearchSource().
			Query(query).
			SearchAfter(q.SearchAfter).
			Size(q.Size).
			Sort("ts", true))
	q2 := elastic.NewSearchRequest().
		Index("rustlesearch-*").
		Source(elastic.
			NewSearchSource().
			Query(query).
			SearchAfter(q.SearchAfter).
			Size(q.Size).
			Sort("ts", false))

	fullQuery := client.MultiSearch().
		Add(q1, q2)

	return fullQuery
}
