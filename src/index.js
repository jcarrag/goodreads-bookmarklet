import libgen from "libgen"

async function getMirror() {
  const urlString = await libgen.mirror()
  console.log(`${urlString} is currently fastest`)
}

getMirror()
