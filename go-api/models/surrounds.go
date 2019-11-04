package models

import (
	"context"
	"encoding/json"
	"reflect"
	"strings"

	"github.com/johnpyp/rustlesearch/go-api/db"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/requests"
	"github.com/olivere/elastic/v7"
)

type Surrounds struct {
}

func reverseAny(s interface{}) {
	n := reflect.ValueOf(s).Len()
	swap := reflect.Swapper(s)
	for i, j := 0, n-1; i < j; i, j = i+1, j-1 {
		swap(i, j)
	}
}
func (s *Surrounds) Query(q requests.Surrounds) ([][]Message, error) {
	log := logging.GetLogger()
	client := db.GetDB()
	queryResult, err := surroundsBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("Search builder error")
		return [][]Message{}, err
	}
	results := [][]Message{}
	for i, resultItem := range queryResult.Responses {
		results = append(results, []Message{})
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
				results[i] = append(results[i], t)
				// Work with tweet
			}
		} else {
			log.Debug().Msg("No hits found")
		}
	}
	reverseAny(results[0])
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
		Add(q2, q1)

	return fullQuery
}
