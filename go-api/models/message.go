package models

import "time"

type Message struct {
	Channel     string    `json:"channel"`
	Text        string    `json:"text"`
	Timestamp   time.Time `json:"ts"`
	Username    string    `json:"username"`
	SearchAfter int       `json:"searchAfter"`
}
