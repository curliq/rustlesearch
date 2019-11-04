package rustlesearch

import "time"

type Message struct {
	Channel     string    `json:"channel"`
	Text        string    `json:"text"`
	Timestamp   time.Time `json:"ts"`
	Username    string    `json:"username"`
	SearchAfter int       `json:"searchAfter"`
}

type Surrounds struct{}

type SurroundsQuery struct {
	Channel     string `json:"channel" form:"channel" binding:"required"`
	SearchAfter int    `json:"searchAfter" form:"search_after" binding:"required"`
	Size        int    `json:"size" form:"size" binding:"required,max=20,min=2"`
}

type SearchQuery struct {
	StartDate   time.Time `json:"startDate" form:"start_date" time_format:"2006-01-02"`
	EndDate     time.Time `json:"endDate" form:"end_date" time_format:"2006-01-02"`
	Channel     string    `json:"channel" form:"channel"`
	Username    string    `json:"username" form:"username"`
	Text        string    `json:"text" form:"text"`
	SearchAfter int       `json:"searchAfter" form:"search_after"`
}

type Search struct {
	StartDate   time.Time `json:"startDate" form:"start_date" time_format:"2006-01-02"`
	EndDate     time.Time `json:"endDate" form:"end_date" time_format:"2006-01-02"`
	Channel     string    `json:"channel" form:"channel"`
	Username    string    `json:"username" form:"username"`
	Text        string    `json:"text" form:"text"`
	SearchAfter int       `json:"searchAfter" form:"search_after"`
}
