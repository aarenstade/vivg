const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const startWebDriver = (driverPath) => {
  const options = new chrome.Options().headless();
  const service = new chrome.ServiceBuilder(driverPath).build();
  chrome.setDefaultService(service);
  let driver = new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
};

// TODO: download images
// Refactor these functions to use promises instead of awaits?
// So that we can use GenerateFrame in a callback

const downloadB64Image = (data, image) => {
  const data = image.substring(22);
};

const downloadImage = async (data, image) => {
  if (image.startsWith("data")) {
    const path = await downloadB64Image(data, image);
    return path;
  }
};

const getImages = async (data, images) => {
  const finalImages = await images.reduce(async (acc, image) => {
    const src = await image.getAttribute("src");
    if (src !== null) {
      const path = downloadImage(data, image);
      console.log(path);
      return [...acc, path];
    }
  });
  return finalImages;
};

const requestImages = async (data) => {
  console.log("getting images");
  let driver = startWebDriver(data.driver);
  const uri = "https://www.bing.com/images/search?q=" + data.word;
  driver.get(uri);
  const images = await driver.findElements(webdriver.By.className("mimg"));
  if (images.length > 0) {
    const downloadedImages = await getImages(data, images);
    console.log(downloadedImages);
  }
};

const GenerateFrame = async (data) => {
  const start = new Date();
  await requestImages(data);
};
