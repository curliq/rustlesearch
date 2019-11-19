package services

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/olivere/elastic/v7"
)

func DoSearchQuery(q models.SearchQuery) (models.SearchResponse, error) {

	c := config.GetConfig()
	log := logging.GetLogger()
	client := elasticsearch.GetDB()
	queryResult, err := searchBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("SearchQuery builder error")
		return models.SearchResponse{}, err
	}
	var results = make([]Message, 0, queryResult.TotalHits())
	if 0 < queryResult.TotalHits() {
		log.Debug().Int64("totalHits", queryResult.TotalHits()).Msg("Total hits")

		// Iterate through results
		for _, hit := range queryResult.Hits.Hits {
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
	totalHits := queryResult.TotalHits()
	return models.SearchResponse{
		Count:      totalHits,
		Messages:   results,
		CountLimit: totalHits == c.GetInt64("elastic.total_hits"),
	}, nil
}
func searchBuilder(q models.SearchQuery, client *elastic.Client) *elastic.SearchService {
	c := config.GetConfig()
	query := elastic.NewBoolQuery()
	if len(q.Channel) != 0 {
		channel := strings.Title(strings.ToLower(q.Channel))
		query = query.Filter(elastic.NewTermQuery("channel", channel))
	}
	if len(q.Username) != 0 {
		query = query.Filter(elastic.NewSimpleQueryStringQuery(q.Username).
			Field("username").
			Flags("AND|ESCAPE|NOT|OR|PHRASE|PRECEDENCE|WHITESPACE"))
	}
	if len(q.Text) != 0 {
		query = query.Filter(elastic.NewSimpleQueryStringQuery(q.Text).
			Field("text").
			DefaultOperator("AND").
			Flags("AND|ESCAPE|NOT|OR|PHRASE|PRECEDENCE|WHITESPACE"))

	}
	var rangeQuery = elastic.NewRangeQuery("ts")

	if !q.StartDate.IsZero() {
		_, offset := q.StartDate.Zone()
		d := q.StartDate.Add(time.Duration(offset) * time.Second).UTC().Format("2006-01-02")
		rangeQuery = rangeQuery.From(d)

	}
	if !q.EndDate.IsZero() {
		_, offset := q.EndDate.Zone()
		d := q.EndDate.Add(time.Duration(offset) * time.Second).UTC().Format("2006-01-02")
		rangeQuery = rangeQuery.To(d)
	}

	query = query.Filter(rangeQuery)

	searchQuery := client.Search().
		TrackTotalHits(c.GetInt("elastic.total_hits")).
		Query(query).
		Index("rustlesearch-*").
		Size(c.GetInt("elastic.size")).
		Sort("ts", false)

	if q.SearchAfter != 0 {
		searchQuery = searchQuery.SearchAfter(q.SearchAfter)
	}
	return searchQuery
}
