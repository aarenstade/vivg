const webdriver = require("selenium-webdriver");

const getImages = (data) => {
  const chromeCapabilities = webdriver.Capabilities.chrome();
  chromeCapabilities.set("chromeOptions", { args: ["--headless"] });
  let driver = new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .build();
  const uri = "https://www.bing.com/images/search?q=" + data.word;
  driver.get(uri);
  let actualImages = [];
  const images = driver.findElements(webdriver.By.className("mimg"));
  if (images.length > 0) {
    images.forEach((image) => {
      console.log(image);
      const src = image.getAttribute("src");
      if (src !== null) {
        actualImages.push(src);
      }
    });
    Logger.Info(actualImages);
    driver.quit();
    return actualImages;
  }
};

const GenerateFrame = (data) => {
  const start = new Date();
  getImages(data);
};
