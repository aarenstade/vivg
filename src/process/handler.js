const errorCallback = (error) => {
  Logger.Error(`Process Failed: ${error}`);
};

const ProcessHandler = (data) => {
  Logger.Info("Storage Bucket: " + data.bucket);
  Logger.Info("Video Title: " + data.title);
  Logger.Info("Starting video generation...");

  const start = new Date();
  ProcessAudio(data)
    .then(function (newPath) {
      data["newAudio"] = newPath;
      return ProcessSpeech(data);
    })
    .then(function (wordList) {
      data["wordList"] = wordList;
      return BuildVideo(data);
    })
    .then(function (finalVid) {
      const end = new Date();
      const time = end - start;
      Logger.Info(`Video Created! Took ${time} seconds.`);
      Logger.Info(`Video Location: ${finalVid}`);
    })
    .catch((error) => errorCallback(error));
};

// Files to write:
// AUDIO
// processAudio
// processSpeech
// VIDEO
// generateFrame
// buildVideo

// delete directories
// manage cache / memory clearing
