const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const writeStream = fs.createWriteStream("apartments.csv", [
  { flags: "a", encoding: null, mode: 0666 }, //this enables appending new data
]);

//Write Headers
writeStream.write(
  `Title,Link,Price,Type of Real Estate,id,Number Of Beds,Number of Toilets,Apartment Area,Location,description\n`
);

function apartments(url) {
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      $(".card-nekretnina-wide-wrapper").each((i, el) => {
        const heading = $(el)
          .find(".card-nekretnina-title")
          .text()
          .replace(/,/g, "");

        const urlString = $(el).find(".card-nekretnina-title").attr("href");

        const price = $(el).find(".card-nekretnina-price").text();

        const typeOfRealEstate = $(el).find(".badge-primary").text();

        const id = $(el).find(".badge-secondary").text();

        const description = $(el)
          .find(".card-nekretnina-text")
          .text()
          .split("\n")
          .join(" ")
          .replace(/,/g, ";");

        const additionalInfo = $(el)
          .find(".card-nekretnina-dodatne-ikone")
          .text()
          .replace(/(^\s+|\s+$)/g, "")
          .split(" ");

        let numberOfBeds = "";
        let apartmentArea = "";
        let numberOfToilets = "";

        if (additionalInfo === undefined || additionalInfo.length == 0) {
          numberOfBeds = "";
          apartmentArea = "";
          numberOfToilets = "";
        } else if (additionalInfo.length === 1) {
          numberOfBeds = "";
          numberOfToilets = "";
          apartmentArea = additionalInfo.shift();
        } else if (additionalInfo.length === 2) {
          numberOfBeds = additionalInfo.shift();
          numberOfToilets = "";
          apartmentArea = additionalInfo.pop();
        } else {
          numberOfBeds = additionalInfo[0];
          numberOfToilets = additionalInfo[1];
          apartmentArea = additionalInfo[2];
        }

        const location = $(el)
          .find(".card-nekretnina-wide-dodatne-ikone-plus-lokacija")
          .text()
          .replace(/(^\s+|\s+$)/g, "")
          .toUpperCase();

        writeStream.write(
          `${heading}, ${urlString}, ${price}, ${typeOfRealEstate}, ${id}, ${numberOfBeds}, ${numberOfToilets}, ${apartmentArea}, ${location}, ${description} \n`
        );
      });
      console.log("Scraping done...");
    }
  });
}

for (let page = 1; page <= 6; page++) {
  const url = `https://freshestate.me/pretraga/?namjena=izdavanje&tip=stan&grad=all&dio_grada=all&broj_soba=all&cijena_od=500&cijena_do=550&limit=15&strana=${page}`;
  apartments(url);
}
