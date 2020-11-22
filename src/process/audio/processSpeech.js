const speech = require("@google-cloud/speech");
const { Storage } = require("@google-cloud/storage");
const wavFileInfo = require("wav-file-info");
const fs = require("fs").promises;
const stopwords = require("./utils/stopwords.json");

const parseWordList = (response) => {
  let wordList = [];
  const results = response.results;
  const transcription = results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  Logger.Info(transcription);
  results[0].alternatives[0].words.forEach((wordInfo) => {
    const word = wordInfo.word;
    const nanos = parseFloat(wordInfo.startTime.nanos / 1000000000);
    const seconds = parseFloat(wordInfo.startTime.seconds);
    const start = seconds + nanos;
    if (stopwords.indexOf(word) >= 0) {
      wordList.push({ word: start });
    }
  });
  return wordList;
};

const uploadToBucket = async (data) => {
  const st = new Storage({ keyFile: data.creds });
  Logger.Info("Uploading Audio to Google Storage Bucket");
  const start = new Date();
  st.bucket(data.bucket)
    .upload(data.newAudio)
    .then((response) => {
      const end = new Date();
      const time = end - start;
      Logger.Info(`File Uploaded in ${time} seconds: ${response}`);
      return "gs://" + data.bucket + data.newAudio;
    })
    .catch((error) => {
      Logger.Error(`Upload Failed: ${error}`);
      throw error;
    });
};

const speechToText = async (data) => {
  const client = new speech.SpeechClient({ keyFile: data.creds });
  const file = await fs.readFile(data.newAudio);
  const audioBytes = file.toString("base64");
  const audio = data.longRunning
    ? { uri: data.audioUri }
    : { content: audioBytes };
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: data.audioSampleRate,
    languageCode: "en-US",
    enableWordTimeOffsets: true,
  };
  const request = {
    audio: audio,
    config: config,
  };
  if (data.longRunning) {
    Logger.Info(`Awaiting API Response...`);
    client
      .longRunningRecognize(request)
      .then((data) => {
        console.log("long running response");
        const response = data[0];
        console.log(response);
        return response.promise();
      })
      .then((data) => {
        console.log("response promise returned");
        const response = data[0];
        Logger.Info(`Got Back Text!`);
        const parsed = parseWordList(response);
        Logger.Info(parsed);
      });
    // TODO: return parsed
  } else {
    Logger.Info(`Awaiting API Response...`);
    const [response] = await client.recognize(request);
    const parsed = parseWordList(response);
    Logger.Info(`Got Back Text!`);
    console.log(parsed);
    return parsed;
  }
};

const ProcessSpeech = (data) => {
  console.log("processing speech with");
  console.log(data.creds, data.bucket, data.newAudio);
  return new Promise((resolve, reject) => {
    Logger.Info("Processing Speech to Text");
    wavFileInfo.infoByFilename(data.newAudio, function (err, info) {
      if (err) Promise.reject("Failed to read audio file");
      console.log(info);
      data["audioSampleRate"] = info.header.sample_rate;
      data["duration"] = info.duration;
    });
    if (data.audioSampleRate !== null) {
      if (data.duration > 60) {
        uploadToBuket(data)
          .then((uri) => {
            data["audioUri"] = uri;
            data["longRunning"] = true;
            return speechToText(data);
          })
          .then((wordList) => resolve(wordList))
          .catch((error) => reject(error));
      } else {
        data["longRunning"] = false;
        speechToText(data)
          .then((wordList) => {
            resolve(wordList);
          })
          .catch((error) => reject(error));
      }
    }
  }).catch((error) => {
    return Promise.reject(error);
  });
};
