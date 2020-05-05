const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const PATH_TO_INCOMING_PDFS = path.join(__dirname, "/pdfs");
const PATH_TO_PROCESSED_PDFS = path.join(__dirname, "/processed");

/** ASYNC AWAIT **/

const renameFiles = () => {
  fs.readdir(PATH_TO_INCOMING_PDFS, (err, files) => {
    if (err) {
      errorHandler(err);
    }
    files.forEach(async (file) => {
      try {
        const pathToFile = path.join(__dirname, `/pdfs/${file}`);
        const myPDF = await pdf(pathToFile);
        const text = myPDF.text;
        const urnExpression = /[A-Za-z]{2}\d{6}_V\d{1}_\d{1}|[A-Za-z]{2}\d{6}_V\d{2}_\d{1}/;
        const urn = text.match(urnExpression);
        console.log(urn);
        
        fs.rename(pathToFile, `${PATH_TO_PROCESSED_PDFS}/${urn}.pdf`, (err) => {
          if (err) {
            errorHandler(err, file);
            return err;
          }
        });
      } catch (err) {
        if (err) {
          errorHandler(err, file);
          return err;
        }
      }
    });
  });
};

setInterval(renameFiles, 3000);

const errorHandler = (err, file = 'readdir') => {
  const errorFileName = `${__dirname}/error/${file} Error Log.txt`;
  const errorData = `${err} \n${new Date().toDateString()} ${new Date()
    .getHours()
    .toString()}:${new Date().getMinutes().toString()}`;
  fs.writeFileSync(errorFileName, errorData);
}
