package config

import (
	"github.com/spf13/viper"
	"log"
	"strings"
)

var config *viper.Viper

// Init is an exported method that takes the environment starts the viper
// (external lib) and returns the configuration struct.
func Init() {
	var err error
	config = viper.New()
	replacer := strings.NewReplacer(".", "_")
	config.SetEnvKeyReplacer(replacer)
	config.SetConfigType("yaml")
	config.SetConfigName("config")
	config.AddConfigPath("./config/")
	config.AutomaticEnv()
	config.SetEnvPrefix("vip")
	err = config.ReadInConfig()
	if err != nil {
		log.Fatal("error on parsing configuration file", err)
	}
}

func GetConfig() *viper.Viper {
	return config
}
