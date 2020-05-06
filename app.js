const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const PATH_TO_INCOMING_PDFS = path.join(__dirname, "/pdfs");
const PATH_TO_PROCESSED_PDFS = path.join(__dirname, "/processed");
const PATH_TO_FAILED_PDFS = path.join(__dirname, "/failed");

const renameFiles = () => {
  fs.readdir(PATH_TO_INCOMING_PDFS, (err, files) => {
    if (err) errorHandler(err);
    if (files.length === 0) return;
    files.forEach(async (file) => {
      try {
        const pathToFile = path.join(__dirname, `/pdfs/${file}`);
        const myPDF = await pdf(pathToFile);
        const text = myPDF.text;
        const urnExpression = /[A-Za-z]{2}\d{6}_[vV]{1}\d{1}_\d{2}|[A-Za-z]{2}\d{6}_[vV]{1}\d{2}_\d{2}/;
        const urn = text.match(urnExpression);
        if (urn == null || urn === "null") {
          fs.rename(pathToFile, `${PATH_TO_FAILED_PDFS}/${file}`, (err) => {
            return errorHandler(err, file);
          });
        }
        fs.rename(pathToFile, `${PATH_TO_PROCESSED_PDFS}/${urn}.pdf`, (err) => {
          if (err) errorHandler(err, file);
        });
      } catch (err) {
        if (err) errorHandler(err, file);
      }
    });
  });
};

setInterval(renameFiles, 3000);

const errorHandler = (err, file = "readdir") => {
  const errorFileName = `${__dirname}/error/${file} Error Log.txt`;
  const errorData = `${err} \n${new Date().toDateString()} ${new Date()
    .getHours()
    .toString()}:${new Date().getMinutes().toString()}`;
  fs.writeFileSync(errorFileName, errorData);
  if (file !== "readdir") {
    const pathToFile = path.join(__dirname, `/pdfs/${file}`);
    fs.rename(pathToFile, `${PATH_TO_FAILED_PDFS}/${file}.pdf`, (err) => {
      if (err) {
        return err;
      }
    });
  }
};
