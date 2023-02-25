import './foo'

document.onclick = function () {
  console.log(process.env.FOO)
  console.log(process.env.GO)
}
