package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gbrlsnchs/jwt/v3"
	"github.com/gorilla/mux"
)

type CustomPayload struct {
	Iat    *jwt.Time `json:"iat"`
	Name   string    `json:"name"`
	Tenant string    `json:"tenant"`
	ID     string    `json:"id"`
}

func GetJwt(w http.ResponseWriter, r *http.Request) {
	var hs = jwt.NewHS256([]byte("lua-resty-jwt"))

	now := time.Now()
	pl := CustomPayload{
		Iat:    jwt.NumericDate(now),
		Name:   "customer1",
		Tenant: "mytenant",
		ID:     "a7c7de38-6755-49d8-91d8-b812630abd65",
	}

	token, err := jwt.Sign(pl, hs)

	if err != nil {
		fmt.Println(err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	w.Write(token)
}

func GetIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte("<html><head><title></title></head><body><h1>It works!</h1></body></html>"))
}

func GetRfc2616(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./html/rfc2616.txt")

	if err != nil {
		fmt.Println("File reading error", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write(data)
}
func GetRfc7523(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./html/rfc7523.txt")

	if err != nil {
		fmt.Println("File reading error", err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write(data)
}

func main() {

	server := mux.NewRouter().StrictSlash(true)

	server.HandleFunc("/json-generate", GetJwt).Methods("GET")
	server.HandleFunc("/index.html", GetIndex).Methods("GET")
	server.HandleFunc("/file_read_rfc2616.txt", GetRfc2616).Methods("GET")
	server.HandleFunc("/file_read_rfc7523.txt", GetRfc7523).Methods("GET")

	server.
		PathPrefix("/").
		Handler(http.StripPrefix("/", http.FileServer(http.Dir("./html"))))

	defer (func() {
		http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", 8080), server)
	})()

}
