const path = require('path')
const fsp = require('fs').promises

async function main () {
  try {
    const imageDirectory = path.join(__dirname, '../../img/')
    const mainjs = path.join(__dirname, '../../js/main.js')
  
    const fileNames = await fsp.readdir(imageDirectory)
    let fileNamesString = ''
    fileNames.forEach(name => {
      fileNamesString += `'${name.substring(0, name.length - 4)}',\n`
    })
    
    let mainString = await fsp.readFile(mainjs, 'utf8')
  
    const imageArrayStartPos = mainString.indexOf('const imageList = [')
    const imageArrayEndPos = mainString.indexOf(']', imageArrayStartPos) + 1
    const imageArrayString = mainString.substring(imageArrayStartPos, imageArrayEndPos)
  
    mainString = mainString.replace(imageArrayString, `const imageList = [\n//image loader assumes .png and appends it. all images should be in img/.\n${fileNamesString}\n]`)
    await fsp.writeFile(mainjs, mainString, 'utf8')    
  } catch (error) {
    console.error(error)
  }
}

main()