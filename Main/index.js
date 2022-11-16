import "dotenv/config";
import axios from "axios";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import configFunction from "../config.js";
import dayjs from "dayjs";
import logUpdate from "log-update";
import inquirer from "inquirer";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirpath = path.join(__dirname, "Scripts");
const autoScriptList = [];

fs.readdir(dirpath, (err, files) => {
  autoScriptList.push(...files);
});

const inputs = {
  userInputs: {
    SelectedAccount: "",
    SelectedResponseType: "",
    SelectedResponseParameter: "",
    DataCount: "",
    EnteredPageSize: "",
    CheckedInputFeedIds: "",
    ScriptRender: "",
    ReceivedOutputStatus: "",
    DownloadedFile: "",
    DownloadedFileDir: "",
    VerifiedResult: "",
    ScriptSaved: "",
    scriptFile: "",
  },
  scriptChoice: ["New Script", "Existing Script"],
  accountChoice: ["Trika"],
  responseChoice: ["GET", "POST", "PUT"],
  resParameterChoice: [],
  downloadChoice: ["CSV", "JSON"],
  feedFileData: [],
  savedGetObjectsData: [],
  savedIdsData: [],
};

const ParameterApi = {
  Get_Brand: `/api/catalog/pvt/brand`,
  Get_Category_by_ID: `/api/catalog/pvt/category`,
  Get_Product_by_ID: `/api/catalog/pvt/product`,
  Get_SKU: `/api/catalog/pvt/stockkeepingunit`,
};

inputs.resParameterChoice = Object.keys(ParameterApi);
const UserInputRequest = {
  scriptType: {
    type: "list",
    name: "scriptType",
    message: "Select Script Type",
    choices: inputs.scriptChoice,
  },
  autoScriptFile: {
    type: "list",
    name: "autoScriptFile",
    message: "Select Script",
    choices: autoScriptList,
  },
  autoScriptConfirm: {
    type: "confirm",
    name: "autoScriptConfirm",
    message: "Render this Script?",
    default: true,
  },
  accountInput: {
    type: "list",
    name: "accountInput",
    message: "Select Account Name",
    choices: inputs.accountChoice,
  },
  responseInput: {
    type: "list",
    name: "responseInput",
    message: "Select Response Type",
    choices: inputs.responseChoice,
  },
  responseParameterInput: {
    type: "list",
    name: "responseParameterInput",
    message: "Select Response Parameter",
    choices: inputs.resParameterChoice,
  },
  pageSizeInput: {
    type: "input",
    name: "pageSizeInput",
    message: "Enter Page Size",
  },
  feedIdCheckConform: {
    type: "confirm",
    name: "feedIdCheckConform",
    message: " Check Input Feed Ids?",
    default: true,
  },
  renderConform: {
    type: "confirm",
    name: "renderConform",
    message: "Start Render?",
    default: true,
  },

  resumeConform: {
    type: "confirm",
    name: "resumeConform",
    message: "Render not Completed, Resume it?",
    default: true,
  },
  downloadConform: {
    type: "confirm",
    name: "downloadConform",
    message: "Download File?",
    default: true,
  },
  downloadFormat: {
    type: "checkbox",
    name: "downloadFormat",
    message: "Select Download Format?",
    default: true,
    choices: inputs.downloadChoice,
  },
  displayResult: {
    type: "confirm",
    name: "displayResult",
    message: "Display Result Data?",
    default: true,
  },
  saveScript: {
    type: "confirm",
    name: "saveScript",
    message: "Save this Script?",
    default: true,
  },
};

let autoScript;
const feedFile = fs.readFileSync(path.resolve("feed.json"), "utf8");
const feedFileParse = JSON.parse(feedFile || {});
inputs.feedFileData.push(...feedFileParse);

inquirer.prompt(UserInputRequest.scriptType).then((answers) => {
  console.log(answers.scriptType);
  if (answers.scriptType === "Existing Script") {
    inquirer.prompt(UserInputRequest.autoScriptFile).then((answers) => {
      const scriptFile = fs.readFileSync(
        path.resolve(`${dirpath}/${answers.autoScriptFile}`),
        "utf8"
      );
      const scriptFileParse = JSON.parse(scriptFile || {});
      autoScript = true;
      inputs.userInputs = scriptFileParse.userInputs;
      console.log(
        chalk.bgBlue("\n", "********** Script Info **********", "\n")
      );
      console.log(inputs.userInputs);
      inputs.userInputs.DataCount = inputs.feedFileData.length;

      autoScriptConfirm();
    });
  } else {
    console.log(
      "\n",
      chalk.bgBlue("********** Script Running **********", "\n")
    );
    accountInput();
  }
});

function autoScriptConfirm() {
  inquirer.prompt(UserInputRequest.autoScriptConfirm).then((answers) => {
    if (answers.autoScriptConfirm) {
      if (answers.autoScriptConfirm) {
        console.log(
          "\n",
          chalk.bgBlue("*************** AUTO SCRIPT RUNNING ****************")
        );
        feedIdResult();
      }
    }
  });
}

function accountInput() {
  inquirer.prompt(UserInputRequest.accountInput).then((answers) => {
    console.log(answers.accountInput);
    inputs.userInputs.SelectedAccount = answers.accountInput;
    responseInput();
  });
}
function responseInput() {
  inquirer.prompt(UserInputRequest.responseInput).then((answers) => {
    console.log(answers.responseInput);
    inputs.userInputs.SelectedResponseType = answers.responseInput;
    responseParameterInput();
  });
}

function responseParameterInput() {
  inquirer.prompt(UserInputRequest.responseParameterInput).then((answers) => {
    console.log(answers.responseParameterInput);
    inputs.userInputs.SelectedResponseParameter =
      answers.responseParameterInput;
    pageSizeInput();
  });
}

function pageSizeInput() {
  inquirer.prompt(UserInputRequest.pageSizeInput).then((answers) => {
    console.log(answers.pageSizeInput);
    inputs.userInputs.EnteredPageSize = answers.pageSizeInput;
    feedDataAnalysis();
  });
}

function feedIdCheckConform() {
  if (autoScript) {
    feedIdResult();
  } else {
    inquirer.prompt(UserInputRequest.feedIdCheckConform).then((answers) => {
      if (answers.feedIdCheckConform) {
        feedIdResult();
      } else {
        inputs.userInputs.CheckedInputFeedIds = false;
        render();
      }
    });
  }
}

function feedDataAnalysis() {
  inputs.userInputs.DataCount = inputs.feedFileData.length;
  let tempObject = {
    Account_Name: inputs.userInputs.SelectedAccount,
    Response: inputs.userInputs.SelectedResponseType,
    Parameter: inputs.userInputs.SelectedResponseParameter,
    Page_Size: inputs.userInputs.EnteredPageSize,
    Data_Count: inputs.feedFileData.length,
  };
  console.log(chalk.bgBlue("\n", "Script Summary", "\n"));
  console.log(tempObject, "\n");
  feedIdCheckConform();
}

function feedIdResult() {
  console.log(chalk.bgBlue("\n", "Feed IDs List", "\n"));
  let feedId = [];
  let j = 1;
  let pageCount = Math.ceil(inputs.feedFileData.length / 100);
  for (let i = 1; i <= inputs.feedFileData.length; i++) {
    feedId.push(inputs.feedFileData[i - 1]);
    if (i % 100 == 0 || i == inputs.feedFileData.length) {
      console.log(feedId);
      feedId = [];
      console.log(
        "\n",
        chalk.bgWhite(chalk.black(`===>>> Page ${j++} of ${pageCount} `), "\n")
      );
    }
  }

  inputs.userInputs.CheckedInputFeedIds = true;
  render();
}

function render() {
  if (autoScript) {
    getAPiData(inputs.userInputs.SelectedAccount);
  } else {
    inquirer.prompt(UserInputRequest.renderConform).then((answers) => {
      if (answers.renderConform) {
        inputs.userInputs.ScriptRender = true;
        getAPiData(inputs.userInputs.SelectedAccount);
      } else {
        inputs.userInputs.ScriptRender = false;
        accountInput();
      }
    });
  }
}

function resumeApidata() {
  inquirer.prompt(UserInputRequest.resumeConform).then((answers) => {
    if (answers.resumeConform) {
      getAPiData(inputs.userInputs.SelectedAccount);
    } else {
      downloadFile();
    }
  });
}
async function getAPiData(account) {
  const apiUrl = configFunction(account);
  const headers = apiUrl.headers;
  const apiLink = `${apiUrl.baseURL}${
    ParameterApi[inputs.userInputs.SelectedResponseParameter]
  }`;

  let temp = [];
  const paginationItems = [];

  for (let i = 1; i <= inputs.feedFileData.length; i++) {
    temp.push(inputs.feedFileData[i - 1]);
    if (
      i % inputs.userInputs.pageSize == 0 ||
      i == inputs.feedFileData.length
    ) {
      paginationItems.push(temp);
      temp = [];
    }
  }

  async function apiGetCall(feedId) {
    return axios
      .get(`${apiLink}/${feedId}`, {
        headers,
      })
      .then((res) => {
        responceFeedback(feedId, res.data);
      })
      .catch((e) => {
        throw e.status;
      });
  }

  async function apiPostCall(feed, feedId) {
    return axios
      .post(`${apiLink}/${feedId}`, { ...feed }, { headers })
      .then((res) => {
        responceFeedback(feedId, res.data);
      })
      .catch((e) => {
        throw e.status;
      });
  }

  async function apiPutCall(feed, feedId) {
    return await axios
      .put(`${apiLink}/${feedId}`, { ...feed }, { headers })
      .then((res) => {
        responceFeedback(feedId, res.data);
      })
      .catch((e) => {
        throw e.status;
      });
  }

  function responceFeedback(feedId, feedBack) {
    inputs.savedGetObjectsData.push(feedBack);
    inputs.savedIdsData.push(feedId);
    remainingData =
      inputs.feedFileData.length - inputs.savedGetObjectsData.length;
    dataStatus = `Received ${inputs.userInputs.SelectedResponseParameter} : ${inputs.savedGetObjectsData.length} / Total ${inputs.userInputs.SelectedResponseParameter} : ${inputs.feedFileData.length}, Remaining : ${remainingData}`;
    logUpdate("\n", chalk.green(dataStatus));
    if (remainingData === 0) {
      if (autoScript) {
        inputs.userInputs.ReceivedOutputStatus = dataStatus;
        console.log(dataStatus);
        displayResult();
      } else {
        dispalyResultConfirm();
      }
    }
  }

  let i = 0;
  let remainingData;
  let dataStatus = "";
  let responseInput = inputs.userInputs.SelectedResponseType;
  console.log(chalk.bgBlue("\n", "Data Progress"));

  for (const items of paginationItems) {
    const allCalls = items.map((feed) => {
      let feedId = feed.Id;
      if (!inputs.savedIdsData.includes(feed)) {
        if (responseInput === "GET") {
          apiGetCall(feed);
        }
        if (responseInput === "POST") {
          delete feed.Id;
          apiPostCall(feed, feedId);
        }
        if (responseInput === "PUT") {
          delete feed.Id;
          apiPutCall(feed, feedId);
        }
      }
    });
    await Promise.allSettled(allCalls);
    i++;
  }
  if (remainingData > 0) {
    resumeApidata();
  }
}

function downloadFile() {
  console.log(chalk.bgBlue("\n", "Download Info", "\n"));
  const timestamp = dayjs().format("MM-DD_HH-mm-ss");
  let csvData;
  let filesdir = {};
  for (let i = 0; i < inputs.userInputs.DownloadedFile.length; i++) {
    let format = inputs.userInputs.DownloadedFile[i];
    if (format === "CSV") {
      for (let i = 0; i < inputs.savedGetObjectsData.length; i++) {
        if (i === 0) {
          csvData = `${Object.keys(inputs.savedGetObjectsData[i])}\n`;
        }
        csvData += `${Object.values(inputs.savedGetObjectsData[i])}\n`;
      }
      let fileName = `Output/Csv/${inputs.userInputs.SelectedAccount}_${inputs.userInputs.SelectedResponseType}_${inputs.userInputs.SelectedResponseParameter}_${timestamp}.csv`;
      fs.writeFileSync(`${fileName}`, csvData, "utf8");
      inputs.userInputs.DownloadedFileDir = `${__dirname}/${fileName}`;
      filesdir[format] = `${__dirname}/${fileName}`;
    }
    if (format === "JSON") {
      let fileName = `Output/Json/${inputs.userInputs.SelectedAccount}_${inputs.userInputs.SelectedResponseType}_${inputs.userInputs.SelectedResponseParameter}_${timestamp}.json`;
      fs.writeFileSync(
        `${fileName}`,
        JSON.stringify(inputs.savedGetObjectsData),
        "utf8"
      );
      filesdir[format] = `${__dirname}/${fileName}`;
    }
  }
  inputs.userInputs.DownloadedFileDir = filesdir;
  console.log("File Downloaded Sucessfully:");
  console.log(inputs.userInputs.DownloadedFileDir), "\n";
  if (autoScript) {
    saveScript();
  } else {
    SaveScriptConfirm();
  }
}

function dispalyResultConfirm() {
  inquirer.prompt(UserInputRequest.displayResult).then((answers) => {
    if (answers.displayResult) {
      displayResult();
    } else {
      SaveScriptConfirm();
    }
  });
}

function displayResult() {
  console.log(chalk.bgBlue("\n", "Script Output", "\n"));
  let pageOutPutData = [];
  let j = 1;
  let pageCount = Math.ceil(inputs.savedGetObjectsData.length / 100);
  for (let i = 1; i <= inputs.savedGetObjectsData.length; i++) {
    pageOutPutData.push(inputs.savedGetObjectsData[i - 1]);
    if (i % 100 == 0 || i == inputs.savedGetObjectsData.length) {
      console.log(pageOutPutData);
      pageOutPutData = [];
      console.log(
        "\n",
        chalk.bgWhite(chalk.black(`===>>> Page ${j++} of ${pageCount} `))
      );
    }
  }

  inputs.userInputs.VerifiedResult = true;

  if (autoScript) {
    downloadFile();
  } else {
    inquirer.prompt(UserInputRequest.downloadConform).then((answers) => {
      if (answers.downloadConform) {
        inquirer.prompt(UserInputRequest.downloadFormat).then((answers) => {
          if (UserInputRequest.downloadFormat) {
            inputs.userInputs.DownloadedFile = answers.downloadFormat;
            downloadFile();
          }
        });
      } else {
        SaveScriptConfirm();
      }
    });
  }
}

function SaveScriptConfirm() {
  inquirer.prompt(UserInputRequest.saveScript).then((answers) => {
    if (answers.saveScript) {
      saveScript();
    }
  });
}

function saveScript() {
  inputs.userInputs.ScriptSaved = true;
  const timestamp = dayjs().format("MM-DD_HH-mm-ss");
  let fileName = `Output/Script/${inputs.userInputs.SelectedAccount}_${inputs.userInputs.SelectedResponseType}_${inputs.userInputs.SelectedResponseParameter}_${timestamp}.json`;
  inputs.userInputs.scriptFile = `${__dirname}/${fileName}`;
  fs.writeFileSync(`${fileName}`, JSON.stringify(inputs), "utf8");
  console.log(chalk.bgBlue("Script File Info"));
  console.log(
    "\n",
    "Script Saved Sucessfully to",
    chalk.green(inputs.userInputs.scriptFile),
    "\n"
  );
  console.log(chalk.bgGreen("\n", "Script Outputs"));
  console.log("\n", inputs.userInputs);
}
