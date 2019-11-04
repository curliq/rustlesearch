package rustlesearch

import (
	"strings"

	"github.com/johnpyp/rustlesearch/go-api/config"

	"github.com/olivere/elastic/v7"
)

func surroundsBuilder(q SurroundsQuery, client *elastic.Client) *elastic.MultiSearchService {
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

func searchBuilder(q SearchQuery, client *elastic.Client) *elastic.SearchService {
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
		Index("rustlesearch-*").
		Size(c.GetInt("elastic.size")).
		Sort("ts", false)

	if q.SearchAfter != 0 {
		searchQuery = searchQuery.SearchAfter(q.SearchAfter)
	}
	return searchQuery
}
