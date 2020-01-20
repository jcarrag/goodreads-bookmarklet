import libgen from "libgen"
import got from "got"
import xpath from "xpath"
import { DOMParser } from "xmldom"

async function getMirror() {
  const urlString = await libgen.mirror()
  console.log(`${urlString} is currently fastest`)
  return urlString
}

async function search(mirror, title) {
  const options = {
    mirror: mirror,
    query: title,
    count: 10,
    sort_by: 'size',
    reverse: true
  }

  return await libgen.search(options)
}

async function downloadBook(mirror, title) {
    const data = await search(mirror, title)
    const mobiBooks = data.filter(({extension}) => extension === "epub")
    const book = mobiBooks[0]
    const preDownloadUrl = await libgen.utils.check.canDownload(book.md5)
    const preDownloadPageUnescaped = await got(preDownloadUrl)
    const preDownloadPage = preDownloadPageUnescaped.body.replace(/\t|\r|\n/g, "")
    const doc = new DOMParser().parseFromString(preDownloadPage)
    // XPATH: "/body/table/tbody/tr[1]/td[2]/a/@href"
    const downloadUrl = doc.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[1].childNodes[0].attributes[0].value
    console.log(downloadUrl)
    return await got(downloadUrl)
}

async function handleEvent(event) {
    const { title, fromEmail, toEmail } = event.queryStringParameters
    const mirror = await getMirror()
    const bookBinary = await downloadBook(mirror, title)
    console.log(bookBinary)
    //const response = {
    //    statusCode: 200,
    //    body: JSON.stringify(event),
    //};
    //return response;
    return "OK"
}

const testEvent = {
  queryStringParameters: {
    title: "Getting to Yes: Negotiating Agreement Without Giving In",
    fromEmail: "from@email.com",
    toEmail: "to@email.com"
  }
}

const result = handleEvent(testEvent)

exports.handler = handleEvent

