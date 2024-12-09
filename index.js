// GoogleCloudVisionのAPIキー
let apiKey = PropertiesService.getScriptProperties().getProperty("apiKey");
// GoogleCloudVisionのURL
let visionUrl =
    PropertiesService.getScriptProperties().getProperty("visionUrl") + apiKey;
// LINEの画像を取得するためのURL
let lineImageUrl =
    PropertiesService.getScriptProperties().getProperty("lineImageUrl");
// LINEに返信するためのURL
let lineReplyUrl =
    PropertiesService.getScriptProperties().getProperty("lineReplyUrl");
// LINEのアクセストークン
let accessToken =
    PropertiesService.getScriptProperties().getProperty("accessToken");

function doPost(e) {
    console.log("run");
    let lineContents = e.postData.contents;
    lineContents = JSON.parse(lineContents);
    let id = lineContents.events[0].message.id;
    let replyToken = lineContents.events[0].replyToken;
    // console.log(id);
    console.log(replyToken);

    lineImageUrl = lineImageUrl + id + "/content";
    // console.log(lineImageUrl)

    let res = UrlFetchApp.fetch(lineImageUrl, {
        headers: { Authorization: accessToken },
    }).getContent();
    // console.log(res);

    let image64 = Utilities.base64Encode(res);

    let payload = {
        requests: [
            {
                image: { content: image64 },
                features: [{ type: "TEXT_DETECTION" }],
            },
        ],
    };
    payload = JSON.stringify(payload);

    let visionText = UrlFetchApp.fetch(visionUrl, {
        contentType: "application/json",
        payload: payload,
    }).getContentText();

    visionText = JSON.parse(visionText);
    // console.log(typeof(visionText));
    visionText = visionText.responses[0].fullTextAnnotation.text;
    // console.log(typeof(visionText));
    visionText = JSON.stringify(visionText);

    // console.log(typeof(visionText));
    console.log("visionText:" + visionText);

    let reply = {
        replyToken: replyToken,
        messages: [{ type: "text", text: visionText.replace(/'/g, '"') }],
    };
    reply = JSON.stringify(reply);

    UrlFetchApp.fetch(lineReplyUrl, {
        headers: { Authorization: accessToken },
        contentType: "application/json",
        payload: reply,
    });
}
