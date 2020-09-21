import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
//import * as Crypto from 'expo-crypto';
//import RNSimpleCrypto from "react-native-simple-crypto";
import { JSHmac, CONSTANTS  } from 'react-native-hash';

//const toHex = RNSimpleCrypto.utils.convertArrayBufferToHex;
//const toUtf8 = RNSimpleCrypto.utils.convertArrayBufferToUtf8;
//const toArrayBuffer = RNSimpleCrypto.utils.convertUtf8ToArrayBuffer;
//const toBase64 = RNSimpleCrypto.utils.convertArrayBufferToBase64;

export const uploadToAzureStorage = async(uri, prefix) => {
  let storageKey = "ZionzmYvCuSDKGnIonRVNzuFWXdiBTEUbVEnRq3ARcuNwJeNEj8qRcJjY4XBXrZVcDCQx5F56f+v2eHOi68+zg==";
  let accountName = "petresources";
  let containerName = "images";
  let  uuid = UUID();
  let fileName = `${prefix}_${uuid}`;
  let filePath = uri;
 
  let metadata = await FileSystem.getInfoAsync(filePath,{
    md5: false,
    size: true
  });
  let fileLength = metadata && metadata.exists === true ? metadata.size : 0;
  let fileStream = "";
  if (metadata && metadata.exists === true) {
    fileStream = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64
    });
  }

  let blobType ="BlockBlob";
  let date = new Date().toUTCString();
  let blobServiceVersion = "2014-02-14";

  let storageBlobEndpoint = "https://"+ accountName +".blob.core.windows.net";
  let requestURL = storageBlobEndpoint + "/" + containerName + "/" + fileName;
  let requestMethod = "PUT";

  //console.log("Just before headers...");
  let canonicalizedHeaders = "x-ms-blob-type:"+ blobType +"\nx-ms-date:"+ date +"\nx-ms-version:" + blobServiceVersion;
 // console.log("headers: \n", canonicalizedHeaders);
  let canonicalizedResource = accountName + "/" + containerName + "/" +  fileName;
  //console.log("Canonicalized Resource: \n", canonicalizedResource);

  let stringToSign = requestMethod+"\n\n\n"+fileLength+"\n\napplication/x-www-form-urlencoded\n\n\n\n\n\n\n" + canonicalizedHeaders + "\n/" + canonicalizedResource;

  //let signature = createHmac('sha256', Buffer.from(storageKey, 'base64')).update(stringToSign, 'utf-8').digest('base64');
  //let messageArrayBuffer = toArrayBuffer(toUtf8(Buffer.from(stringToSign)));
  let message = strToUtf8(stringToSign);
  const keyHmac = Buffer.from(storageKey, 'base64').toString();
  //const signatureArrayBuffer = await RNSimpleCrypto.HMAC.hmac256(messageArrayBuffer, keyHmac);
  let signature = await JSHmac(message, keyHmac, CONSTANTS.HmacAlgorithms.HmacSHA256);
  signature = strToBase64(signature);
  console.log("String To Sign", stringToSign);
  console.log("HMAC signature", signature);

  /*let signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Buffer.from(storageKey, 'base64').toString(),
    //{ encoding: Crypto.CryptoEncoding.BASE64 }
  );
  console.log('Signature Part 1: ', signature);
  signature = signature.toString().concat(stringToSign);
  signature = Buffer.from(signature).toString('base64');
  console.log('Signature: ', signature);*/

  let authorizationHeader = "SharedKey "+accountName + ":" + signature;
  console.log('Authorization Header: ', authorizationHeader);

  const result = axios({
        baseURL: requestURL,
        method: requestMethod,
        data:fileStream,
        headers: {
            'Content-Length':fileLength,
            'x-ms-blob-type': blobType,
            'x-ms-date':date,
            'x-ms-version':blobServiceVersion,
            'Authorization' : authorizationHeader
            }
        }).then((response) => {
          console.log("On response: ");
          console.log(response);
        })
        .catch((error) => {
          console.log("On error: ");
          console.log(error);
        })
        .finally(() => {
          console.log("On finally: ");
          //add finally function here if needed 
        });  
};

const UUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

const strToBase64 = (stringInput) => {
  return Buffer.from(stringInput).toString('base64');
};

const strToUtf8 = (stringInput) => {
  return Buffer.from(stringInput).toString('utf-8');
};