/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import Evaporate from "evaporate";

import { sha256 as SHA256 } from 'js-sha256';
import store from "../../store/APIStore";
import { PrimeUploadInfo } from "../models/PrimeModels";

import {
  RESET_UPLOAD,
  SET_UPLOAD_NAME,
  SET_UPLOAD_PROGRESS,
} from "../store/actions/fileUpload/actionTypes";
import { getALMConfig, getALMObject } from "./global";
import { RestAdapter } from "./restAdapter";

const sparkMD5 =require('spark-md5');

let evaporateInstance: any;
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
    await initEvaporate(getEvaporateConfig());
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEvaporateConfig(): any {
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
    cryptoMd5Method: (data: any) => btoa(sparkMD5.ArrayBuffer.hash(data, true)),
    cryptoHexEncodedHash256: SHA256,
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
