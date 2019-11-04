package server

import (
	"fmt"
	"github.com/johnpyp/rustlesearch/go-api/config"
)

func Init() {
	config := config.GetConfig()
	r := NewRouter()
	r.Run(fmt.Sprintf(":%s", config.GetString("server.port")))
}
