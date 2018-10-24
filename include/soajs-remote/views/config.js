var mydomain = location.hostname || "localhost";

var appConfig = {
    url: "http://" + mydomain + ":1337",
	"kubernetes": {
		"minPort": 0,
		"maxPort": 2767
	},
};
