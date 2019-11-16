package models

import "time"

type SurroundsQuery struct {
	Channel  string    `json:"channel" form:"channel" binding:"required"`
	Username string    `json:"username" form:"username" binding:"required"`
	DateTime time.Time `json:"date" form:"date" binding:"required"`
}

type SearchQuery struct {
	StartDate   time.Time `json:"startDate" form:"start_date" time_format:"2006-01-02"`
	EndDate     time.Time `json:"endDate" form:"end_date" time_format:"2006-01-02"`
	Channel     string    `json:"channel" form:"channel"`
	Username    string    `json:"username" form:"username"`
	Text        string    `json:"text" form:"text"`
	SearchAfter int       `json:"searchAfter" form:"search_after"`
}
