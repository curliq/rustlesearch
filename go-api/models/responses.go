package models

type SearchResponse struct {
	CountLimit bool      `json:"countLimit"`
	Count      int64     `json:"count"`
	Messages   []Message `json:"messages"`
}

type SurroundsResponse struct {
	Match string `json:"match"`
	Body  string `json:"body"`
}
