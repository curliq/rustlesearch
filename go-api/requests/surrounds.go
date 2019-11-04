package requests

import ()

type Surrounds struct {
	Channel     string `json:"channel" form:"channel" binding:"required"`
	SearchAfter int    `json:"searchAfter" form:"search_after" binding:"required"`
	Size        int    `json:"size" form:"size" binding:"required,max=20,min=2"`
}
