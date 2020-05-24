const request = require("request");
const cheerio = require("cheerio");
const csv = require("csv-parser");
const fs = require("fs");

const writeStream = fs.createWriteStream("apartments.csv", [
  { flags: "a", encoding: null, mode: 0666 }, //this enables appending new data
]);

const arrayFromCSVdata = [];
fs.createReadStream("apartments.csv")
  .pipe(csv())
  .on("data", (row) => {
    arrayFromCSVdata.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

//arrayFromCSVdata[i].id
function fetch(url) {
  const obj = {};
  const arrayOfIds = [];
  const arrayOfHeadings = [];
  const arrayOfUrls = [];
  const arrayOfPrices = [];
  const arrayOfTypeOfRealEstates = [];
  const arrayOfDescriptions = [];
  const arrayOfLocations = [];
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      $(".card-nekretnina-wide-wrapper").each((i, el) => {
        const id = $(el).find(".badge-secondary").text();
        arrayOfIds.push(id);

        const heading = $(el)
          .find(".card-nekretnina-title")
          .text()
          .replace(/,/g, "");
        arrayOfHeadings.push(heading);

        const urlString = $(el).find(".card-nekretnina-title").attr("href");
        arrayOfUrls.push(urlString);

        const price = $(el).find(".card-nekretnina-price").text();
        arrayOfPrices.push(price);

        const typeOfRealEstate = $(el).find(".badge-primary").text();
        arrayOfTypeOfRealEstates.push(typeOfRealEstate);

        const description = $(el)
          .find(".card-nekretnina-text")
          .text()
          .split("\n")
          .join(" ")
          .replace(/,/g, ";");
        arrayOfDescriptions.push(description);

        const location = $(el)
          .find(".card-nekretnina-wide-dodatne-ikone-plus-lokacija")
          .text()
          .replace(/(^\s+|\s+$)/g, "")
          .toUpperCase();
        arrayOfLocations.push(location);
      });
    }
  });
  obj.id = arrayOfIds;
  obj.heading = arrayOfHeadings;
  obj.url = arrayOfUrls;
  obj.price = arrayOfPrices;
  obj.typeOfRealEstate = arrayOfTypeOfRealEstates;
  obj.description = arrayOfDescriptions;
  obj.location = arrayOfLocations;
  return obj;
}

function searchForUrl() {
  let obj = {};
  let receivedObj = {};
  for (let page = 1; page <= 6; page++) {
    const url = `https://freshestate.me/pretraga/?namjena=izdavanje&tip=stan&grad=all&dio_grada=all&broj_soba=all&cijena_od=500&cijena_do=550&limit=15&strana=${page}`;
    receivedObj = fetch(url);
  }
  const intersection = receivedObj.id.filter(
    (el) => !arrayFromCSVdata.includes(el)
  );
  obj.intersection = intersection;
  obj.receivedObj = receivedObj;
  return obj;
}

function appendToCsv() {
  let obj = searchForUrl();
  let intersection = obj.intersection;
  let receivedObj = obj.receivedObj;
  const numberOfBeds = "";
  const numberOfToilets = "";
  const apartmentArea = "";
  if (intersection.length === 0) {
    console.log("prekida");
  } else {
    console.log("ima na sajtu nema u csv: " + intersection);
    let indexArray = [];
    intersection.forEach((el) => indexArray.push(arrayOfIds.indexOf(el)));
    for (let i = 0; i < indexArray.length; i++) {
      let heading = receivedObj.heading[indexArray[i]];
      let id = receivedObj.id[indexArray[i]];
      let url = receivedObj.url[indexArray[i]];
      let price = receivedObj.price[indexArray[i]];
      let typeOfRealEstate = receivedObj.typeOfRealEstate[indexArray[i]];
      let description = receivedObj.description[indexArray[i]];
      let location = receivedObj.location[indexArray[i]];

      writeStream.write(
        `${heading}, ${url}, ${price}, ${typeOfRealEstate}, ${id}, ${numberOfBeds}, ${numberOfToilets}, ${apartmentArea}, ${location}, ${description} \n`
      );
    }
  }
}
