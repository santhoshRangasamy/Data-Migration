import inquirer from "inquirer";
import axios from "axios";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { dirname } from "path";
import { fileURLToPath } from "url";
// THIS ALL TYPE OF INPUT EXAMPLES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirpath = path.join(__dirname, "data");
const localData = [];

fs.readdir(dirpath, (err, files) => {
  localData.push(...files);
});

console.log(chalk.bgBlue("********** DATA MIGRATION PROCESS **********", "\n"));
const temp = [];
const allfeedFile = [];
const idChoice = [];
let idValues = [];
const compareArray = [];
const operation = ["Find", "Sort"];
let selectId = [];
const uniqueKey = [];

async function getlocalJsonData(data) {
  const feedFile = fs.readFileSync(path.resolve(`data/${data}`), "utf8");
  const allfeedFile = JSON.parse(feedFile || `{}`);
  temp.push(...allfeedFile);
  console.log(temp);
  dataAnalyse();
}
// THIS ALL TYPE OF INPUT EXAMPLES

// INPUT DATA KEYS
async function getlocalJsonDataId() {
  var keys = Object.keys(...temp);
  idChoice.push(...keys);
  getKeyValueUnique(idChoice);
}

async function getdata(url) {
  const response = await fetch(url);
  var data = await response.json();
  temp.push(...data);
  console.log(temp);
  dataAnalyse();
}

async function dataAnalyse() {
  await inquirer.prompt(UserInputDatas.localJsonIdConform).then((answers) => {
    getlocalJsonDataId();
    inquirer.prompt(UserInputDatas.localJsonIdValueConform).then((answers) => {
      inquirer.prompt(UserInputDatas.idChoice).then((answers) => {
        selectId.push(...answers.idChoice);
        getlocalJsonDataIdDetails(selectId);
      });
    });
  });
}

// INPUT DATA KEYS
function getKeyValueUnique(data) {
  const dataTypeList = {};
  let UniqueStatus = true;
  for (let i = 0; i < data.length; i++) {
    const checkUnique = [];
    const checkDataType = [];
    for (let j = 0; j < temp.length; j++) {
      const unquArray = temp[j];
      const UniqueobjectValue = unquArray[data[i]];
      //check Unique or Not
      if (checkUnique.includes(UniqueobjectValue)) {
        UniqueStatus = false;
      } else {
        checkUnique.push(UniqueobjectValue);
      }

      //check Data Type
      if (!checkDataType.includes(typeof UniqueobjectValue)) {
        checkDataType.push(typeof UniqueobjectValue);
      }
    }
    dataTypeList[data[i]] = {
      datatype: [...checkDataType],
      unuquestatus: UniqueStatus,
    };
  }
  console.log("\n", chalk.bgMagenta("Data Type and Unique Status"));
  console.table(dataTypeList);
}

// OBJECT FILTER
function getlocalJsonDataIdDetails(data) {
  const primaryKey = idValues;
  idValues = [];

  for (let j = 0; j < temp.length; j++) {
    const obj = {};
    for (let i = 0; i < data.length; i++) {
      const newArray = temp[j];
      const objectValue = newArray[data[i]];
      obj[data[i]] = objectValue;
    }
    idValues.push(obj);
  }

  console.log(chalk.bgMagenta("\n", "Property Details", "\n"));
  console.log(idValues);

  // OBJECT FILTER

  inquirer.prompt(UserInputDatas.operationInput).then((answers) => {
    const selectOperation = answers.operationInput;
    inquirer.prompt(UserInputDatas.operationInputId).then((answers) => {
      const selectOperationId = answers.operationInputId;
      let operationQuestionInput = `what you ${chalk.bgMagenta(
        selectOperation
      )} in ${chalk.bgMagenta(selectOperationId)} Key ?`;
      UserInputDatas.operationQuestion.message = operationQuestionInput;
      inquirer.prompt(UserInputDatas.operationQuestion).then((answers) => {
        const result = idValues.filter(
          (data) => data[selectOperationId] === answers.operationAnswer
        );
        console.log(
          "\n",
          chalk.bgMagenta(
            `${selectOperation} WHERE ${selectOperationId} = ${answers.operationAnswer}`
          )
        );
        console.log(result);
      });
    });
  });
}

const UserInputDatas = {
  dataFile: {
    type: "list",
    name: "dataFile",
    message: "Select Data File!",
    choices: ["Local File", "External API"],
  },
  apiInput: {
    type: "input",
    name: "api",
    message: "Enter Your Api URL",
    default: "https://api.github.com/users/hadley/orgs",
  },
  localJsonConform: {
    type: "confirm",
    name: "localJsonConform",
    message: "Check Local Json Data?",
    default: true,
  },
  localJsonIdConform: {
    type: "confirm",
    name: "localJsonIdConform",
    message: "Need all the Property Details?",
    default: true,
  },
  localDataFile: {
    type: "list",
    name: "localDataFile",
    message: "Select Local File !",
    choices: localData,
  },
  localJsonIdValueConform: {
    type: "confirm",
    name: "localJsonIdConform",
    message: "Get Perticular Property Key Value?",
    default: true,
  },
  idChoice: {
    type: "checkbox",
    name: "idChoice",
    message: "Select Property Key!",
    choices: idChoice,
  },
  operationInput: {
    type: "list",
    name: "operationInput",
    message: "Select Data Operation!!",
    choices: operation,
  },
  operationInputId: {
    type: "list",
    name: "operationInputId",
    message: "Select Data Operation id",
    choices: selectId,
  },
  operationQuestion: {
    type: "input",
    name: "operationAnswer",
    message: "",
  },
};

inquirer.prompt(UserInputDatas.dataFile).then((answers) => {
  if (answers.dataFile === "Local File") {
    inquirer.prompt(UserInputDatas.localDataFile).then((answers) => {
      getlocalJsonData(answers.localDataFile);
    });
  } else {
    inquirer.prompt(UserInputDatas.apiInput).then((answers) => {
      getdata(answers.api);
    });
  }
});
