var style = document.createElement("style");
style.innerHTML = `
  .modal-bookmarklet {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
  }

  .modal-bookmarklet-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }
`;

var myModalHtml = `
<div id="myModal" class="modal-bookmarklet">

  <div class="modal-bookmarklet-content">
    <p>Please enter the email addresses you use to send to Kindle</p>
     <form id="bookmarklet-form">
       From email:<br>
       <input type="text" name="fromEmail"><br>
       Kindle email:<br>
       <input type="text" name="toEmail">
       <input type="submit" value="Submit">
     </form>
  </div>

</div>
`;

var DESKTOP_TITLE_XPATH = '//*[@id="bookTitle"]';
var DESKTOP_AUTHOR_XPATH = '//*[@id="bookAuthors"]/span[2]/div/a/span';
var MOBILE_TITLE_XPATH = '//div[@class="bookInfoGroup"]/h1/span';
var MOBILE_AUTHOR_XPATH = '//a[@class="authorName"]/span';

var getBookTitle = function() {
  var desktopTitle = document
    .evaluate(
      DESKTOP_TITLE_XPATH,
      document,
      null,
      XPathResult.STRING_TYPE,
      null
    )
    .stringValue.trim();

  var mobileTitle = document
    .evaluate(MOBILE_TITLE_XPATH, document, null, XPathResult.STRING_TYPE, null)
    .stringValue.trim();

  if (desktopTitle == "") {
    return mobileTitle;
  } else {
    return desktopTitle;
  }
};

var getBookAuthor = function() {
  var desktopAuthor = document
    .evaluate(
      DESKTOP_AUTHOR_XPATH,
      document,
      null,
      XPathResult.STRING_TYPE,
      null
    )
    .stringValue.trim();

  var mobileAuthor = document
    .evaluate(
      MOBILE_AUTHOR_XPATH,
      document,
      null,
      XPathResult.STRING_TYPE,
      null
    )
    .stringValue.trim();

  if (desktopAuthor == "") {
    return mobileAuthor;
  } else {
    return desktopAuthor;
  }
};

var sendBook = async function(fromEmail, toEmail) {
  console.log("sending request");

  const response = await fetch(
    "https://82aoiobtl0.execute-api.eu-west-2.amazonaws.com/production?query=" +
      encodeURIComponent(query) +
      "&from=" +
      fromEmail +
      "&to=" +
      toEmail,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("Fetch error:", response.statusText);
  }

  console.log("request sent");
};

var title = getBookTitle();
var author = getBookAuthor();
var query = title + " " + author;

var handleFormSubmit = function(event) {
  event.preventDefault();
  var formData = new FormData(event.target);
  var fromEmail = formData.get("fromEmail");
  var toEmail = formData.get("toEmail");

  setFromEmail(fromEmail);
  setToEmail(toEmail);

  sendBook(fromEmail, toEmail, query);

  document.getElementById("myModal").remove();
};

var setFromEmail = function(fromEmail) {
  return window.localStorage.setItem("fromEmail", fromEmail);
};

var setToEmail = function(toEmail) {
  return window.localStorage.setItem("toEmail", toEmail);
};

var getFromEmail = function() {
  return window.localStorage.getItem("fromEmail");
};

var getToEmail = function() {
  return window.localStorage.getItem("toEmail");
};

var onBookmarketCall = async function() {
  var fromEmail = getFromEmail();
  var toEmail = getToEmail();

  if (fromEmail != undefined && toEmail != undefined) {
    return await sendBook(fromEmail, toEmail, query);
  } else {
    return openModal();
  }
};

var openModal = function() {
  document.body.insertAdjacentHTML("beforeend", myModalHtml);

  var form = document.getElementById("bookmarklet-form");
  form.onsubmit = handleFormSubmit;

  var myModal = document.getElementById("myModal");

  window.onclick = function(event) {
    if (event.target == myModal) {
      myModal.style.display = "none";
    }
  };
};

document.head.appendChild(style);

onBookmarketCall();
