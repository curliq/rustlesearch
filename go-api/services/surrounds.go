package services

import (
	"bufio"
	"bytes"
	"compress/zlib"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/johnpyp/rustlesearch/go-api/config"
	"github.com/johnpyp/rustlesearch/go-api/logging"
	"github.com/johnpyp/rustlesearch/go-api/models"
	"github.com/rs/zerolog/log"
)

func DoSurroundsQuery(q models.SurroundsQuery) (models.SurroundsResponse, error) {
	c := config.GetConfig()

	date := q.DateTime.UTC().Format("2006-01-02")
	orlPath := c.GetString("paths.orl")

	channel := strings.Title(strings.ToLower(q.Channel))
	path := fmt.Sprintf("%s/%s::%s.txt.zz", orlPath, channel, date)
	data, err := readFlate(filepath.Clean(path))

	if err != nil {

		return models.SurroundsResponse{}, err
	}

	reader := bufio.NewReaderSize(bytes.NewReader(data), len(data))
	datetimeOrl := q.DateTime.Format("2006-01-02 15:04:05 utc")
	username := strings.ToLower(q.Username)
	messageSubstring := fmt.Sprintf("[%s] %s", datetimeOrl, username)
	return models.SurroundsResponse{
		Body:  getLines(reader, messageSubstring, 40),
		Match: messageSubstring,
	}, nil
}

func readFlate(path string) ([]byte, error) {
	log := logging.GetLogger()
	var buf []byte
	f, err := os.Open(path)

	defer f.Close()
	if err != nil {
		log.Error().Caller().Err(err).Msg("readFlate error")
		return nil, err
	}
	r, err := zlib.NewReader(f)

	defer r.Close()
	if err != nil {
		log.Error().Caller().Err(err).Msg("readFlate error")
		return nil, err
	}
	buf, err = ioutil.ReadAll(r)
	if err != nil {
		log.Error().Caller().Err(err).Msg("readFlate error")
		return nil, err
	}
	return buf, nil
}

func getLines(reader *bufio.Reader, match string, n int) string {
	var beforeBuffer []string
	var afterSlice []string
	isFound := false
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {

				log.Error().Err(err).Msg("error reading bytes")
			}
			break
		}

		if !isFound {
			if strings.Contains(strings.ToLower(line), match) {
				isFound = true
				afterSlice = append(afterSlice, line)
			} else {
				beforeBuffer = append(beforeBuffer, line)
				length := len(beforeBuffer)
				if length > n {
					beforeBuffer = beforeBuffer[1:]
				}
			}
		} else {
			if len(afterSlice) <= n {
				afterSlice = append(afterSlice, line)
			} else {
				break
			}
		}

	}
	fmt.Println(len(beforeBuffer), len(afterSlice), match)
	return strings.Join(beforeBuffer, "") + strings.Join(afterSlice, "")
}
