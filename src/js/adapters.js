
// Adapter for navigator.getUserMedia
export const getUserMedia = (
  navigator.getUserMedia || 
  navigator.webkitGetUserMedia || 
  navigator.mozGetUserMedia || 
  navigator.msGetUserMedia
).bind(navigator)

// Adapter for window.URL
const vendorURL = window.URL || window.webkitURL

export const createObjectURL = vendorURL.createObjectURL
