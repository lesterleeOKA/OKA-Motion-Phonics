const apiManager = {
  maxRetries: 10,
  QuestionDataHeaderName: "questions",
  questionJson: null,
  accountJson: null,
  payloads: null,
  iconDataUrl: null,
  loginName: null,

  async postGameSetting(jwt, appId, onCompleted = null, onError = null) {
    let loadQAApi = `https://ro2.azurewebsites.net/RainbowOne/index.php/PHPGateway/proxy/2.8/?api=ROGame.get_game_setting&json=["${appId}"]&jwt=`;
    const api = loadQAApi + jwt;
    console.log("api:", api);
    const formData = new FormData();
    let retryCount = 0;
    let requestSuccessful = false;

    while (retryCount < this.maxRetries && !requestSuccessful) {
      try {
        const response = await fetch(api, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/json',
            'typ': 'jwt',
            'alg': 'HS256'
          }
        });

        if (!response.ok) {
          if (onError) onError();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        const jsonStartIndex = responseText.indexOf(`{"${this.QuestionDataHeaderName}":`);
        if (jsonStartIndex !== -1) {
          const jsonData = responseText.substring(jsonStartIndex);
          console.log("Response:", jsonData);

          const jsonNode = JSON.parse(jsonData);
          this.questionJson = jsonNode.questions;
          this.accountJson = jsonNode.account;
          const photoJsonUrl = jsonNode.photo;
          this.payloads = jsonNode.payloads;

          console.log("questions:", JSON.stringify(this.questionJson, null, 2));
          console.log(`account: ${JSON.stringify(this.accountJson, null, 2)}`);
          console.log(`photo: ${photoJsonUrl}`);
          console.log("payloads:", JSON.stringify(this.payloads, null, 2));

          if (photoJsonUrl) {
            const modifiedPhotoDataUrl = photoJsonUrl.replace(/"/g, "");
            this.iconDataUrl = modifiedPhotoDataUrl.startsWith("https://")
              ? modifiedPhotoDataUrl
              : "https:" + modifiedPhotoDataUrl;

            console.log(`Downloaded People Icon!! ${this.iconDataUrl}`);
            //this.peopleIcon = await this.loadPeopleIcon(imageUrl);
          }

          if (this.accountJson.length > 0 && this.accountJson.display_name) {
            this.loginName = this.accountJson.display_name.replace(/"/g, "");
            console.log(`login Name: ${this.loginName}`);
          }

          if (onCompleted) onCompleted();
          requestSuccessful = true;

        } else {
          if (onError) onError();
          console.error("JSON data not found in the response.");
        }

      } catch (error) {
        if (onError) onError();
        console.error("Error:", error.message);
        retryCount++;
        console.log(`Retrying... Attempt ${retryCount}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
      }
    }

    if (!requestSuccessful) {
      if (onError) onError();
      console.error(`Failed to get a successful response after ${maxRetries} attempts.`);
    }
  },
}

export { apiManager };
