import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const src = path.join(root, '_import-full-work')
const dest = path.join(root, 'battleasia.gg', 'public', 'full-work')

fs.mkdirSync(path.join(dest, 'css'), { recursive: true })
fs.mkdirSync(path.join(dest, 'js'), { recursive: true })

function rewriteAssets(text) {
  return text
    .replaceAll('url("../assets/', 'url("/assets/fw/')
    .replaceAll('url(../assets/', 'url(/assets/fw/')
    .replaceAll('src="assets/', 'src="/assets/fw/')
    .replaceAll("src='assets/", "src='/assets/fw/")
    .replaceAll('href="assets/', 'href="/assets/fw/')
    .replaceAll('"assets/', '"/assets/fw/')
}

const html = rewriteAssets(fs.readFileSync(path.join(src, 'index.html'), 'utf8')).replace(
  '<script src="js/fixtures.js"></script>\n  <script src="js/app.js"></script>',
  '<script src="js/fixtures.js"></script>\n  <script src="js/live.js"></script>\n  <script src="js/app.js"></script>',
)
fs.writeFileSync(path.join(dest, 'index.html'), html)
fs.writeFileSync(path.join(dest, 'css', 'styles.css'), rewriteAssets(fs.readFileSync(path.join(src, 'css', 'styles.css'), 'utf8')))
fs.writeFileSync(path.join(dest, 'js', 'fixtures.js'), rewriteAssets(fs.readFileSync(path.join(src, 'js', 'fixtures.js'), 'utf8')))
fs.writeFileSync(path.join(dest, 'js', 'app.js'), fs.readFileSync(path.join(src, 'js', 'app.js'), 'utf8'))

console.log('copied zip landing to', dest)
