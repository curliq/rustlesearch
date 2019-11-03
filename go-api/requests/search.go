package requests

import (
	"time"
)

type Search struct {
	StartDate time.Time `json:"startDate" form:"startDate" time_format:"2006-01-02"`
	EndDate   time.Time `json:"endDate" form:"endDate" time_format:"2006-01-02"`
	Channel   string    `json:"channel" form:"channel"`
	Username  string    `json:"username" form:"username"`
	Text      string    `json:"text" form:"text"`
}

