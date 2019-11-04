package config

import (
	"errors"
	"github.com/spf13/viper"
	"strings"
)

var config *viper.Viper

// Init is an exported method that takes the environment starts the viper
// (external lib) and returns the configuration struct.
func Init() error {
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
		return errors.New("error on parsing configuration file" + err.Error())
	}
	return nil
}

func GetConfig() *viper.Viper {
	return config
}
