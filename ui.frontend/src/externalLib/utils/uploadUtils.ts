import Evaporate from "evaporate";
import sparkMD5 from 'spark-md5';
import sha256 from 'js-sha256';
// import { State } from "../store/state";
// import { Screen } from "../store/state";
import store from "../../store/APIStore";
import { PrimeUploadInfo } from "../models/PrimeModels";
// import { AnyAction } from "redux";
import {
  RESET_UPLOAD,
  SET_UPLOAD_NAME,
  SET_UPLOAD_PROGRESS,
} from "../store/actions/fileUpload/actionTypes";
import { getALMConfig, getALMObject } from "../utils/global";
import { RestAdapter } from "./restAdapter";

// declare let AWS: any;
let evaporateInstance: any;
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// declare let Evaporate: any;
// var AWS = require("aws-sdk/dist/aws-sdk-react-native");

let awsCredJsonObj: PrimeUploadInfo = {
  awsKey: "",
  bucket: "",
  region: "",
  key: "",
  awsUrl: "",
};

async function uploadInfo() {
  const baseApiUrl = getALMConfig().primeApiURL;
  const response = await RestAdapter.ajax({
    url: `${baseApiUrl}/uploadInfo`,
    method: "GET",
  });
  const parsedResponse = JSON.parse(
    typeof response === "string" ? response : ""
  );
  const data = {
    awsKey: parsedResponse.awsKey,
    bucket: parsedResponse.bucket,
    region: parsedResponse.region,
    key: parsedResponse.key,
    awsUrl: parsedResponse.awsUrl,
  };
  return data;
}

export async function getUploadInfo() {
  if (!evaporateInstance) {
    const data: PrimeUploadInfo = await uploadInfo();
    awsCredJsonObj = data;
    const awsRegionUrl =
      awsCredJsonObj && awsCredJsonObj.region!.indexOf("us-") === 0
        ? ".s3.amazonaws.com/"
        : `.s3.${awsCredJsonObj.region}.amazonaws.com/`;
    awsCredJsonObj.awsUrl = `https://${awsCredJsonObj.bucket}${awsRegionUrl}${awsCredJsonObj.key}`;
    initEvaporate(getEvaporateConfig());
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEvaporateConfig(): any {
  const state = store.getState();
  const baseApiUrl = getALMConfig().primeApiURL;
  const accessTokenString = "oauth " + getALMObject().getAccessToken();

  return {
    aws_key: awsCredJsonObj.awsKey, // REQUIRED
    bucket: awsCredJsonObj.bucket, // REQUIRED
    awsRegion: awsCredJsonObj.region,
    cloudfront: true,
    xhrWithCredentials: true,
    signerUrl: `${baseApiUrl}uploadSigner`,
    awsSignatureVersion: "4",
    computeContentMd5: true,
    signHeaders: {
      "Content-Type": "application/json",
      authorization: accessTokenString,
    },
    aws_url: awsCredJsonObj.awsUrl,

    cryptoMd5Method: function (data: any) {
      return btoa(sparkMD5.ArrayBuffer.hash(data, true))

      // return AWS.util.crypto.md5(data, "base64");
    },
    cryptoHexEncodedHash256: function (data: any) {
      return sha256;
      // return AWS.util.crypto.sha256(data, "hex");
    },
    logging: false,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initEvaporate(config: any): Promise<any> {
  try {
    const instance = await Evaporate.create(config);
    evaporateInstance = instance;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(name: string, file: File) {
  const state = store.getState();
  try {
    store.dispatch({ value: name, type: SET_UPLOAD_NAME });
    const result = await evaporateInstance.add({
      name,
      file,
      progress: (progressValue: never) => {
        if (state.fileUpload.uploadProgress !== progressValue) {
          store.dispatch({
            value: Math.ceil(progressValue * 100),
            type: SET_UPLOAD_PROGRESS,
          });
        }
      },
    });
    return awsCredJsonObj.awsUrl + "/" + result;
  } catch (err) {
    // TODO: replace with real logging
    console.error(err);
    store.dispatch({ type: RESET_UPLOAD });
    return "";
  }
}
export async function cancelUploadFile(name: string) {
  try {
    await evaporateInstance
      .cancel(awsCredJsonObj.bucket + "/" + name)
      .then(function () {
        console.log("Canceled file upload");
      });
    return {
      type: RESET_UPLOAD,
    };
  } catch (err) {
    // TODO: replace with real logging
    console.error(err);
    // return {
    //     type: ActionTypes.NAVIGATE_TO,
    //     screen: Screen.ERROR,
    // };
  }
}
