var TITLE_XPATH = '//*[@id="bookTitle"]';
var AUTHOR_XPATH = '//*[@id="bookAuthors"]/span[2]/div/a/span';

var title = document
  .evaluate(TITLE_XPATH, document, null, XPathResult.STRING_TYPE, null)
  .stringValue.trim();
var author = document
  .evaluate(AUTHOR_XPATH, document, null, XPathResult.STRING_TYPE, null)
  .stringValue.trim();

console.log("title: " + title);
console.log("author: " + author);
var query = title + " " + author;

var result = (async () => {
  console.log("sending request");

  const response = await fetch(
    "https://gi40wm34t1.execute-api.ap-northeast-1.amazonaws.com/default/goodreads-bookmarklet?query=" +
      query +
      "&from=test@email.com&to=test@kindle.com",
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("Fetch error:", response.statusText);
  }
  const result = await response.json();

  console.log("result: " + result);
})();
