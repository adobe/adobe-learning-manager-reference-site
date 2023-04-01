const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const WebpackCommon = {};

console.log("__dirname", __dirname);
const rootFolderPath = path.resolve(__dirname, "..");
const distFolder = path.resolve(rootFolderPath, "build");
const srcFolderPath = path.resolve(rootFolderPath, "src");
const assetsManifiestPath = path.resolve(
  srcFolderPath,
  ".transient",
  "outputFileMap.json"
);

HASH_BYTES = 20;
const GetHash = (contentStr) => {
  return crypto
    .createHash("md5")
    .update(contentStr)
    .digest("hex")
    .substr(0, HASH_BYTES);
};

// const exportFolderPath = path.resolve(rootFolderPath, "export");

console.log("srcFolderPath", srcFolderPath, "distFolder", distFolder);
let isProd = false;

WebpackCommon.setBuildArgs = (_isProd, _isPrBuild) => {
  isProd = _isProd;
};

const WriteFileFromString = (filePath, data) => {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, data, "utf-8");
};

const WriteFileFromObject = (filePath, dataObj) => {
  WriteFileFromString(filePath, JSON.stringify(dataObj));
};
const CopyFile = (sourcePath, destPath) => {
  if (!fs.existsSync(path.dirname(destPath))) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
  }

  fs.copyFileSync(sourcePath, destPath, fs.constants.COPYFILE_FICLONE);
};

const GetFileAsJsonData = (filePath) => {
  return JSON.parse(GetFileAsString(filePath));
};

const OutputHashedFileNameFromContent = (
  fileName,
  fileContents,
  destFolder
) => {
  let contentHash = GetHash(fileContents);
  let outputPath = path.join(
    destFolder,
    path.parse(fileName).name + "." + contentHash + path.parse(fileName).ext
  );
  WriteFileFromString(outputPath, fileContents);
  return outputPath;
};

const minifyOneTranslationFile = (
  shouldMinify,
  sourceTranslationFilePath,
  destTranslationFolder
) => {
  let fileName = path.basename(sourceTranslationFilePath);
  if (shouldMinify) {
    let translationsMap = GetFileAsJsonData(sourceTranslationFilePath);
    let outputMap = translationsMap;
    return OutputHashedFileNameFromContent(
      fileName,
      JSON.stringify(outputMap),
      destTranslationFolder
    );
  } else {
    //dev case
    CopyFile(
      sourceTranslationFilePath,
      path.join(destTranslationFolder, fileName)
    );
    return path.join(destTranslationFolder, fileName);
  }
};

const GetAllFilesSync = (
  dirPath,
  truncatePrefixPath,
  fileSuffix,
  _arrayOfFiles
) => {
  var files = fs.readdirSync(dirPath);
  _arrayOfFiles = _arrayOfFiles || [];
  fileSuffix = fileSuffix || [""];
  truncatePrefixPath = truncatePrefixPath || "";
  files.forEach(function (file) {
    var pathToFile = path.join(dirPath, file);
    if (fs.statSync(pathToFile).isDirectory()) {
      _arrayOfFiles = GetAllFilesSync(
        pathToFile,
        truncatePrefixPath,
        fileSuffix,
        _arrayOfFiles
      );
    } else {
      var pathToUse = path.join(dirPath, file);
      for (let ii = 0; ii < fileSuffix.length; ++ii) {
        if (pathToUse.endsWith(fileSuffix[ii])) {
          _arrayOfFiles.push(pathToUse.replace(truncatePrefixPath, ""));
          break;
        }
      }
    }
  });
  return _arrayOfFiles;
};

const MinifyTranslations = (
  shouldMinify,
  sourceTranslationFolder,
  destTranslationFolder
) => {
  console.log(
    "Minifying and copying translation sources from",
    sourceTranslationFolder,
    " to ",
    destTranslationFolder
  );
  let retval = {}; //map of fileName to output dest relative path name
  //Our base reference is en-US.json. So, use it first
  const enUSJson = "en_US.json";
  let baseTranslation = path.join(sourceTranslationFolder, enUSJson);
  console.log("Minifying en us");
  retval[enUSJson] = minifyOneTranslationFile(
    shouldMinify,
    baseTranslation,
    destTranslationFolder
  );
  let translationFilesArr = GetAllFilesSync(
    sourceTranslationFolder,
    "",
    ".json"
  );
  for (let ii = 0; ii < translationFilesArr.length; ++ii) {
    let translationFilePath = translationFilesArr[ii];
    if (translationFilePath != baseTranslation) {
      console.log("Minifying " + translationFilePath);
      retval[path.basename(translationFilePath)] = minifyOneTranslationFile(
        shouldMinify,
        translationFilePath,
        destTranslationFolder
      );
    }
  }
  return retval;
};

const DoPreBuildMinifyingSteps = (
  isProd,
  destFolder,
  sourceFolder,
  manifestFilePath
) => {
  console.log("PreBuild steps starting...");
  const fileMap = MinifyTranslations(
    isProd,
    path.join(sourceFolder, "almLib/i18n"),
    path.join(destFolder, "almLib/i18n")
  );

  let manifestFileMap = {};
  if (!isProd) {
    manifestFileMap["devManifest"] = "true";
  }
  for (let key in fileMap) {
    manifestFileMap[key] = fileMap[key].replace(destFolder + path.sep, "");
  }

  WriteFileFromObject(manifestFilePath, manifestFileMap);
  console.log("PreBuild steps complete");
};

const GetFileAsString = (filePath) => {
  //Keys order is preserved atleast in nodejs
  return fs.readFileSync(filePath, "utf8");
};

const OutputHashedFileName = (sourceFilePath, destFolder) => {
  let fileName = path.basename(sourceFilePath);
  let outputPath = "";
  if (fileName.endsWith(".json")) {
    //text file
    let fileContents = GetFileAsString(sourceFilePath);
    fileContents = JSON.stringify(JSON.parse(fileContents));
    let contentHash = GetHash(fileContents);
    outputPath = path.join(
      destFolder,
      path.parse(fileName).name + "." + contentHash + path.parse(fileName).ext
    );
    WriteFileFromString(outputPath, fileContents);
  }
  return outputPath;
};

const DoPostBuildConfigSteps = (isProd, destFolder) => {
  console.log("PostBuild steps started");

  let fileMap = {};
  if (isProd) {
    let fileList = GetAllFilesSync(destFolder);
    for (let ii = 0; ii < fileList.length; ++ii) {
      let fileName = path.basename(fileList[ii]);
      let unhashedFileName = fileName.replace(
        new RegExp(`(\.[a-f0-9]{${HASH_BYTES}})(\..*)$`),
        "$2"
      );
      fileMap[unhashedFileName] = fileList[ii];
    }
  }
  let manifestFileMap = {};
  for (let key in fileMap) {
    manifestFileMap[key] = fileMap[key].replace(destFolder + path.sep, "");
  }

  WriteFileFromObject(path.join(destFolder, "manifest.json"), manifestFileMap);
  console.log("PostBuild steps complete");
  return manifestFileMap;
};

WebpackCommon.commonDevPlugins = [
  {
    //preHook
    apply: (compiler) => {
      compiler.hooks.entryOption.tap("PrimePlugin", (context, entry) => {
        console.log("PrimePlugin PreHook: isProd:", isProd);
        //what all to write -- This is needed in dev as generating manifest in src folder triggers build again
        //all translation folder entries
        DoPreBuildMinifyingSteps(
          isProd,
          distFolder,
          srcFolderPath,
          assetsManifiestPath
        );
      });
      compiler.hooks.afterEmit.tap("PrimePlugin", () => {
        console.log("PrimePlugin PostHook: isProd:", isProd);
        DoPostBuildConfigSteps(isProd, distFolder);
      });
    },
  },
];

WebpackCommon.srcFolderPath = srcFolderPath;
WebpackCommon.distFolder = distFolder;
module.exports = WebpackCommon;
