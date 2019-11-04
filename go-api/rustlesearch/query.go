package rustlesearch

import (
	"context"
	"encoding/json"

	"github.com/johnpyp/rustlesearch/go-api/elasticsearch"
	"github.com/johnpyp/rustlesearch/go-api/logging"
)

func (s *Search) Query(q SearchQuery) ([]Message, error) {
	log := logging.GetLogger()
	client := elasticsearch.GetDB()
	queryResult, err := searchBuilder(q, client).Do(context.Background())
	if err != nil {
		log.Error().Err(err).Msg("SearchQuery builder error")
		return []Message{}, err
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

	return results, nil
}

func (s *Surrounds) Query(q SurroundsQuery) ([][]Message, error) {
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
