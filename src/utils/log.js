const consoleElement = document.getElementById("console");

class Log {
  Info = (message) => {
    consoleElement.append("[INFO]: " + message + "\n");
  };

  Frame = (i, totalFrames, message, time) => {
    consoleElement.append(
      `[FRAME ${i}/${totalFrames}] ${message} created in ${time}`
    );
  };

  Error = (message) => {
    consoleElement.append("\n[ERROR]: " + message + "\n");
  };
}
