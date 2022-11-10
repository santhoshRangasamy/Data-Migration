import "dotenv/config";
import axios from "axios";
import path from "path";
import fs from "fs";

const test = [];
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

let x = 0;
for (let i = 0; i < feedFileData.length; i++) {
  feedFileData[i].KeyWords = feedFileData[i].Id;
  feedFileData[i].BrandId = feedFileData[i].BrandId + 8;
  feedFileData[i].CategoryId = feedFileData[i].CategoryId + 189;
  feedFileData[i].DepartmentId = feedFileData[i].CategoryId;
  delete feedFileData[i].Id;
  test.push(feedFileData[i]);
  console.log(i, "-", feedFileData[i].KeyWords);
}

fs.writeFileSync(`migration_Test.json`, JSON.stringify(test), "utf8");
