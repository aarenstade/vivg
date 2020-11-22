const { ipcRenderer } = require("electron");

// define elements
const credsElement = document.getElementById("google-creds");
const bucketName = document.getElementById("bucket-name");
const chromeDriver = document.getElementById("chrome-driver");

const videoTitle = document.getElementById("video-title");
const audioPath = document.getElementById("audio-path");

const outputButton = document.getElementById("output-select");
const generateButton = document.getElementById("generate-button");

const Logger = new Log();

let creds = "";
let bucket = "";
let driver = "";
let title = "";
let audio = "";
let output = "";

const testButton = document.getElementById("test-button");
const queryField = document.getElementById("query-field");

testButton.addEventListener("click", async () => {
  const query = queryField.value;
  const data = {
    word: query,
    driver,
    output,
  };
  await GenerateFrame(data);
});

// get google creds
credsElement.onchange = () => {
  const path = credsElement.files[0];
  creds = path.path;
  Logger.Info("Google Credentials: " + path.path);
};

chromeDriver.onchange = () => {
  const path = chromeDriver.files[0].path;
  driver = path;
  Logger.Info("Chrome Driver: " + driver);
};

audioPath.onchange = () => {
  const path = audioPath.files[0];
  audio = path.path;
  Logger.Info("Audio File: " + path.path);
};

// get output directory
outputButton.addEventListener("click", () => {
  ipcRenderer.send("select-dir");
  ipcRenderer.on("dir", (event, message) => {
    Logger.Info("Output Folder: " + message);
    output = message;
  });
});

// start video generation or show error
generateButton.addEventListener("click", () => {
  bucket = bucketName.value;
  title = videoTitle.value;
  const data = {
    creds,
    bucket,
    title,
    audio,
    output,
  };

  const hasEmptyData = Object.values(data).some((d) => d.length < 1);
  console.log(`hasEmptyData ${hasEmptyData}`);
  if (!hasEmptyData) {
    ProcessHandler(data);
  } else {
    Logger.Error("Failed to start...");
    Logger.Error(
      "Make sure you've entered your Google credentials, storage bucket URI, video title, audio file, and output folder."
    );
  }
});
