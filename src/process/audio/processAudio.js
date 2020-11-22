const ffmpeg = require("fluent-ffmpeg");

const ProcessAudio = async (data) => {
  return new Promise(function (resolve, reject) {
    Logger.Info("Processing Audio...");
    const dotIndex = data.audio.indexOf(".");
    const fileType = data.audio.substr(dotIndex + 1);
    const newPath = data.audio.substr(0, dotIndex) + "_MONO.wav";
    Logger.Info(`newPath ${newPath}`);
    new ffmpeg()
      .input(data.audio)
      .inputFormat(fileType)
      .format("wav")
      .audioChannels(1)
      .saveToFile(newPath)
      .on("start", (command) => {
        Logger.Info(`Process Audio Started with: ${command}`);
      })
      .on("error", () => {
        Logger.Error(`Failed processing audio...`);
        reject("Error processing audio");
      })
      .on("end", () => {
        Logger.Info("Audio Processed!");
        resolve(newPath);
      });
  }).catch((error) => Promise.reject(error));
};
