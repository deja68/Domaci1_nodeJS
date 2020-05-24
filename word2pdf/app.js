const fs = require("fs");
const express = require("express");
const upload = require("express-fileupload");
const docxConverter = require("docx-pdf");

const app = express();

app.use(upload());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", (req, res) => {
  console.log(req.files);
  if (req.files.upfile) {
    const file = req.files.upfile;
    const name = file.name;

    if (name.endsWith("docx")) {
      console.log("Ime doc fajla je: " + name);
      const uploadpath = __dirname + /uploads/ + name;
      const convertedFilePath = __dirname + /converted/ + "./output.pdf";

      file.mv(uploadpath, (err) => {
        if (err) {
          console.log("File upload failed!", name, err);
          res.send("Error occured");
        } else {
          docxConverter(uploadpath, convertedFilePath, function (err, result) {
            if (err) {
              console.log("Converter failed!", err);
            } else {
              let file = fs.createReadStream(convertedFilePath);
              let stat = fs.statSync(convertedFilePath);
              res.setHeader("Content-Length", stat.size);
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                "attachment; filename=output.pdf"
              );
              file.pipe(res);
            }
          });
        }
      });
    } else {
      res.send("The file you uploaded isn't .docx");
    }
  } else {
    res.send("No file selected");
  }
});
let port = process.env.PORT || 3000;
console.log("port", port);
app.listen(port, () => {
  console.log("Connected!");
});
