const axios = require("axios");
const cheerio = require("cheerio");

exports.traffic = function (challanNumber) {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://echallan.parivahan.gov.in/api/challan-status/challan/${challanNumber}`)
      .then((res) => {
        const $ = cheerio.load(res.data);
        const extractedData = {};

        $("h5").each((index, element) => {
          const key = $(element).text().trim();
          const tableData = [];

          $(element)
            .next("table")
            .find("tbody tr")
            .each((i, row) => {
              const rowData = {};
              $(row)
                .find("td")
                .each((j, cell) => {
                  const header = $(cell).attr("scope");
                  const value = $(cell).text().trim();
                  rowData[header] = value;
                });
              tableData.push(rowData);
            });

          extractedData[key] = tableData;
        });

        resolve(extractedData);
      })
      .catch((error) => reject(error));
  });
};
