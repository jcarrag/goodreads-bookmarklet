import dotenv from "dotenv";
import libgen from "libgen";
import got from "got";
import { DOMParser } from "xmldom";

dotenv.config();

const MAILJET_USER = process.env.MAILJET_USER;

const getMirror = async function() {
  const urlString = await libgen.mirror();
  console.log(`${urlString} is currently fastest`);
  return urlString;
};

const search = async function(mirror, query) {
  const options = {
    mirror: mirror,
    query: query,
    count: 10,
    sort_by: "size",
    reverse: true
  };

  return await libgen.search(options);
};

const downloadBook = async function(mirror, query) {
  const books = await search(mirror, query);
  console.log("books found: " + books.length);
  const mobiBooks = books.filter(({ extension }) => extension === "mobi");
  console.log("mobi books found: " + mobiBooks.length);
  const preDownloadUrl = await libgen.utils.check.canDownload(mobiBooks[0].md5);
  const preDownloadPageUnescaped = await got(preDownloadUrl);
  const preDownloadPage = preDownloadPageUnescaped.body.replace(
    /\t|\r|\n/g,
    ""
  );
  const doc = new DOMParser().parseFromString(preDownloadPage);
  // XPATH: "/body/table/tbody/tr[1]/td[2]/a/@href"
  const downloadUrl =
    doc.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[1]
      .childNodes[0].attributes[0].value;
  console.log(downloadUrl);

  return await got(downloadUrl, {
    responseType: "buffer",
    resolveBodyOnly: true
  });
};

const sendEmail = async function(from, to, attachmentName, attachmentBuffer) {
  return await got.post(
    "https://" + MAILJET_USER + "@api.mailjet.com/v3.1/send",
    {
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        Messages: [
          {
            From: { Email: from },
            To: [{ Email: to }],
            TextPart: "Greetings from Mailjet.",
            Attachments: [
              {
                Filename: attachmentName + ".mobi",
                ContentType: "text/plain",
                Base64Content: Buffer.from(attachmentBuffer).toString("base64")
              }
            ]
          }
        ]
      }
    }
  );
};

const handleEvent = async function(event) {
  const { query, from, to } = event.queryStringParameters;
  console.log("query: " + query);
  console.log("from: " + from);
  console.log("to: " + to);
  const mirror = await getMirror();
  const bookBuffer = await downloadBook(mirror, query);
  const result = await sendEmail(from, to, query, bookBuffer);

  return {
    statusCode: 200,
    body: "OK"
  };
};

//const testEvent = {
//  queryStringParameters: {
//    query: "games people play eric berne",
//    from: "test@email.com",
//    to: "test@kindle.com"
//  }
//}
//const result = handleEvent(testEvent)

exports.handler = handleEvent;
