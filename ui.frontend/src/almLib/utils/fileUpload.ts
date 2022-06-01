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


// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// declare let AWS: any;
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// declare let Evaporate: any;
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// let evaporateInstance: any;

// let awsCredJsonObj: UploadInfoFields = {
//     awsKey: "",
//     bucket: "",
//     region: "",
//     key: "",
//     awsUrl: "",
// };

// export async function getUploadInfo(state: State): Promise<void> {
//     if (!evaporateInstance) {
//         const data: UploadInfoFields = await uploadInfo(state.client);
//         awsCredJsonObj = data;
//         const awsRegionUrl =
//             awsCredJsonObj && awsCredJsonObj.region!.indexOf("us-") === 0
//                 ? ".s3.amazonaws.com/"
//                 : `.s3.${awsCredJsonObj.region}.amazonaws.com/`;
//         awsCredJsonObj.awsUrl = `https://${awsCredJsonObj.bucket}${awsRegionUrl}${awsCredJsonObj.key}`;
//         initEvaporate(getEvaporateConfig());
//     }
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function getEvaporateConfig(): any {
//     const state = store.getState();
//     return {
//         aws_key: awsCredJsonObj.awsKey, // REQUIRED
//         bucket: awsCredJsonObj.bucket, // REQUIRED
//         awsRegion: awsCredJsonObj.region,
//         cloudfront: true,
//         xhrWithCredentials: true,
//         signerUrl: `${state.client.endpoint}/primeapi/v2/uploadSigner`,
//         awsSignatureVersion: "4",
//         computeContentMd5: true,
//         signHeaders: {
//             "Content-Type": "application/vnd.api+json",
//             "X-CSRF-TOKEN": state.client.csrf,
//         },
//         aws_url: awsCredJsonObj.awsUrl,
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         cryptoMd5Method: function (data: any) {
//             return AWS.util.crypto.md5(data, "base64");
//         },
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         cryptoHexEncodedHash256: function (data: any) {
//             return AWS.util.crypto.sha256(data, "hex");
//         },
//         logging: false,
//     };
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function initEvaporate(config: any): Promise<any> {
//     try {
//         const instance = await Evaporate.create(config);
//         evaporateInstance = instance;
//     } catch (error) {
//         console.log(error);
//     }
// }

// export async function uploadFile(
//     name: string,
//     file: File,
//     type?: ActionTypes.UPDATE_USER_AVATAR_URL
// ): Promise<AnyAction> {
//     const state = store.getState();
//     try {
//         store.dispatch({ value: name, type: ActionTypes.SET_UPLOAD_NAME });
//         const result: string = await evaporateInstance.add({
//             name,
//             file,
//             progress: (progressValue: never) => {
//                 console.log("Progress", Math.ceil(progressValue * 100));

//                 if (state.fileUpload.uploadProgress != progressValue) {
//                     store.dispatch({
//                         value: Math.ceil(progressValue * 100),
//                         type: ActionTypes.SET_UPLOAD_PROGRESS,
//                     });
//                 }
//             },
//         });
//         return {
//             type,
//             icon: `${awsCredJsonObj.awsUrl}/${result}`,
//         };
//     } catch (err) {
//         // TODO: replace with real logging
//         console.error(err);
//         store.dispatch({ type: ActionTypes.RESET_UPLOAD });
//         return {
//             type: ActionTypes.NAVIGATE_TO,
//             screen: Screen.ERROR,
//         };
//     }
// }
// export async function cancelUploadFile(name: string): Promise<AnyAction> {
//     try {
//         await evaporateInstance
//             .cancel(awsCredJsonObj.bucket + "/" + name)
//             .then(function () {
//                 console.log("Canceled file upload");
//             });
//         return {
//             type: ActionTypes.RESET_UPLOAD,
//         };
//     } catch (err) {
//         // TODO: replace with real logging
//         console.error(err);
//         return {
//             type: ActionTypes.NAVIGATE_TO,
//             screen: Screen.ERROR,
//         };
//     }
// }

export { }