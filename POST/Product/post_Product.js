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
  path.resolve("post_Data.json"),
  "utf8"
);
const savedGetObjectsDataParse = JSON.parse(savedGetObjectsDataFile || {});
savedGetObjectsData.push(...savedGetObjectsDataParse);

async function productDetails(feeddata) {
  const res = await axios.post(
    `${baseURL}/api/catalog/pvt/product`,
    { ...feeddata },
    { headers }
  );
  // apiData = res.data;
  // return res.data;
}

for (let i = 0; i < feedFileData.length; i++) {
  let feedId = i;
  let feeddata = feedFileData[i];
  if (!savedIdsData.includes(feedId)) {
    const category = productDetails(feeddata)
      .then(() => {
        savedGetObjectsData.push(feeddata);
        savedIdsData.push(feedId);
        console.log(
          "Post Product",
          savedGetObjectsData.length,
          ":",
          "Saved Ids",
          savedIdsData.length,
          "/",
          "Total Product",
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
          `post_Data.json`,
          JSON.stringify(savedGetObjectsData),
          "utf8"
        );
      })
      .catch((e) => {
        console.log("Error");
      });
  }
}
