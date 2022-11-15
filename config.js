import "dotenv/config";

const apiEnv = {
  Trika: {
    baseURL: process.env.VTEX_BASEURL,
    headers: {
      "X-VTEX-API-AppKey": process.env.VTEX_APPKEY,
      "X-VTEX-API-AppToken": process.env.VTEX_APPTOKEN,
    },
  },
  Cornerup: {
    baseURL: process.env.BASEURL,
    headers: {
      "X-VTEX-API-AppKey": process.env.APPKEY,
      "X-VTEX-API-AppToken": process.env.APPTOKEN,
    },
  },
};

function configFunction(account) {
  return apiEnv[account];
}

export default configFunction;
