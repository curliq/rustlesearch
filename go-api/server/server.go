package server

import "github.com/johnpyp/rustlesearch/go-api/config"

func Init() {
	config := config.GetConfig()
	r := NewRouter()
	r.Run(config.GetString("server.port"))
}
