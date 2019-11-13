package services

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/olivere/elastic/v7"
)

func DoSurroundsQuery(q models.SurroundsQuery) ([][]Message, error) {
	log := logging.GetLogger()
	client := elasticsearch.GetDB()
	queryResult, err := surroundsBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("SurroundsQuery builder error")
		return [][]Message{}, err
	}
	results := [][]Message{}
	for i, resultItem := range queryResult.Responses {
		results = append(results, []Message{})
		if resultItem.TotalHits() > 0 {
			log.Debug().Int64("totalHits", resultItem.TotalHits()).Msg("Total hits")
			for _, hit := range resultItem.Hits.Hits {
				var t Message

				err := json.Unmarshal(hit.Source, &t)
				if err != nil {
					log.Print(err)
				}
				t.SearchAfter = int(hit.Sort[0].(float64))
				results[i] = append(results[i], t)
			}
		} else {
			log.Debug().Msg("No hits found")
		}
	}
	utils.ReverseAny(results[0])
	return results, nil
}
func surroundsBuilder(q models.SurroundsQuery, client *elastic.Client) *elastic.MultiSearchService {
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
