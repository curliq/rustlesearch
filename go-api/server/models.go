package server

type (
	Server struct {
		*Options
	}

	Options struct {
		Environment string
		Port        int
	}
)
