const axios = require("axios");
const cheerio = require("cheerio");

exports.traffic = function (challanNumber) {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://echallan.parivahan.gov.in/api/challan-status/challan/${challanNumber}`)
      .then((res) => {
        const $ = cheerio.load(res.data);

        let extractedData = {};
        
        // Extract data under h5 headers
        $("h5").each((index, element) => {
          const key = $(element).text().trim();
          const tableData = [];

          if ($(element).parent().is("div")) {
            // Check if there's a table below the heading
            const tableElement = $(element).parentsUntil("div.row").last().find("table");
            if (tableElement.length > 0) {
              tableElement.find("tbody tr").each((i, row) => {
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
            } else {
              // If no table found, use empty array as default
              tableData = [];
            }
          } else {
            // Ignore other elements without tables
            tableData = [];
          }

          extractedData[key] = tableData;
        });

        resolve(extractedData);
      })
      .catch((error) => reject(error));
  });
};
