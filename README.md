## Roadmap

- Use kindlegen to convert epub to mobi

  - https://aws.amazon.com/blogs/compute/running-executables-in-aws-lambda/
  - Download binary, commit to source
  - In JS, download from github, save to file, spawn execute
  - Convert file, send in email, delete file

- If the above fails, try to send a pdf

- Automate upload to AWS lambda

  - Github actions?

- Landing page to install bookmarklet

- Limit AWS/email capacity to free tier only

- Provide popup for users to enter email addresses

  - Store in localstorage
  - Attempt to read back when bookmarklet called

- Send email to fromEmail explaining when no books could be found?

- Test on multiple devices

- Metrics?
