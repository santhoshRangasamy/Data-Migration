import "dotenv/config";
import axios from "axios";
import path from "path";
import fs from "fs";

const feedFileData = [];
const savedIdsData = [];
const savedGetObjectsData = [];
let apiData = "";

//GET API DETAILS
const baseURL = process.env.VTEX_BASEURL;
const headers = {
  "X-VTEX-API-AppKey": process.env.VTEX_APPKEY,
  "X-VTEX-API-AppToken": process.env.VTEX_APPTOKEN,
};

//GET FEED DATAS FROM LOCAL
const feedFile = fs.readFileSync(path.resolve("feed.json"), "utf8");
const feedFileParse = JSON.parse(feedFile || {});
feedFileData.push(...feedFileParse);

//GET SAVED IDS FROM LOCAL
const savedIdsFile = fs.readFileSync(path.resolve("saved_Ids.json"), "utf8");
const savedIdsParse = JSON.parse(savedIdsFile || {});
savedIdsData.push(...savedIdsParse);

//GET SAVED OBJECTS FROM LOCAL
const savedGetObjectsDataFile = fs.readFileSync(
  path.resolve("saved_Get_Objects.json"),
  "utf8"
);
const savedGetObjectsDataParse = JSON.parse(savedGetObjectsDataFile || {});
savedGetObjectsData.push(...savedGetObjectsDataParse);

async function brandDetails(feedId) {
  const res = await axios.get(`${baseURL}/api/catalog/pvt/brand/${feedId}`, {
    headers,
  });
  apiData = res.data;
  return res.data;
}

for (let i = 0; i < feedFileData.length; i++) {
  let feedId = feedFileData[i];
  if (!savedIdsData.includes(feedId)) {
    const brand = brandDetails(feedId)
      .then(() => {
        savedGetObjectsData.push(apiData);
        savedIdsData.push(feedId);
        console.log(
          "Received Brands",
          savedGetObjectsData.length,
          ":",
          "Saved Ids",
          savedIdsData.length,
          "/",
          "Total Brands",
          feedFileData.length,
          "Remaining :",
          feedFileData.length - savedGetObjectsData.length
        );
        fs.writeFileSync(
          `saved_Ids.json`,
          JSON.stringify(savedIdsData),
          "utf8"
        );
        fs.writeFileSync(
          `saved_Get_Objects.json`,
          JSON.stringify(savedGetObjectsData),
          "utf8"
        );
      })
      .catch((e) => {
        console.log("Error");
      });
  }
}
