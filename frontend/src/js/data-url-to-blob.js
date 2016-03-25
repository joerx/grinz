export default function dataURLtoBlob(dataurl) {
  let n, u8arr, bstr
  let [head, data] = dataurl.split(',')
  let [_, mime] = head.match(/:(.+\/.+);/)

  bstr = atob(data)
  n = data.length
  u8arr = new Uint8Array(n)

  while(n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], {type: mime})
}
