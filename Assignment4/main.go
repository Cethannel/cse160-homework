package main

import (
	"image"
	"image/png"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	textures := []string{
		"dirt.png",
		"cobblestone.png",
		"planks_oak.png",
	}

	atlas := image.NewRGBA(image.Rect(0, 0, 32, len(textures)*32))
	atlas.Rect.Max.Y = len(textures) * 32

	for i, texture := range textures {
		file, err := os.Open("assets/textures/" + texture)
		defer file.Close()
		if err != nil {
			panic(err)
		}
		img, err := png.Decode(file)
		println("Image dimentions are: " + img.Bounds().String())
		if err != nil {
			panic(err)
		}
		offset := 32 * i
		println("Offset is: %d", offset)
		for x := 0; x < 32; x++ {
			for y := 0; y < 32; y++ {
				pxl := img.At(x, y)
				atlas.Set(x, offset+y, pxl)
			}
		}
	}

	println("Atlas dimentions are: " + atlas.Bounds().String())

	outFile, err := os.Create("assets/textures/atlas.png")
	defer outFile.Close()
	if err != nil {
		panic(err)
	}
	if err := png.Encode(outFile, atlas); err != nil {
		panic(err)
	}

	router := gin.Default()
	router.GET("/textures.html", func(ctx *gin.Context) {
		out := ""

		for i, texture := range textures {
			out += `<img src="` + "../assets/textures/" + texture + `" id="hotbar` + strconv.Itoa(i) + `"/>`
		}

		ctx.Data(200, "text/html", []byte(out))
	})
	router.Static("/assets", "./assets")
	router.Static("/World", "./World")
	router.Static("/lib", "./lib")

	// Listen and serve on 0.0.0.0:8080
	router.Run(":8080")
}
