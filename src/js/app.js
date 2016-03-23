import React from 'react'
import {getUserMedia, createObjectURL} from './adapters'

export default class GrinzApp extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <h1>Grinz!</h1>
        <CaptureFrame />
      </div>
    )
  }
}

// TODO: this is rather hackish - too much direct manipulation of component attributes
// (canvas size, button state, etc.) - a cleaner approach would break this down into smaller
// components and orchestrate component state through setState() from a higher level via props
class CaptureFrame extends React.Component {

  constructor(props) {
    super()
    this._width = 400
    this._height = 300
    this._canCapture = false
    this.state = {src: null}
  }

  componentDidMount() {
    getUserMedia(
      {audio: false, video: true},
      stream => this.setState({src: createObjectURL(stream)}),
      err => console.log('Please allow to use the camera!')
    )
  }

  _onCaptureButtonClick() {
    if (!this._canCapture) return
    else this._capturePhoto()
  }

  _onCanPlay() {
    this._canCapture = true
  }

  _capturePhoto() {
    let [vw, vh] = [this._video.videoWidth, this._video.videoHeight]
    let ratio = vh/vw
    let [w, h] = [this._width, this._width * ratio]

    this._canvas.setAttribute('width', w)
    this._canvas.setAttribute('height', h)

    let context = this._canvas.getContext('2d')
    context.drawImage(this._video, 0, 0, w, h)
  
    let data = this._canvas.toDataURL('image/png')
    let match = data.match(/^data:(.+\/.+);base64,(.*)$/)
    if (!match) {
      console.error('invalid image data encoding')
    } else {
      let [_, mime, base64str] = match
      // POST /images
      // Content-Type: image/png
      // Content-Encoding: base64
    }

    this._img.setAttribute('src', data)
  }

  render() {
    const style = {
      width: this._width + 'px',
      height: this._height + 'px',
      backgroundColor: 'black',
    }

    return (
      <div className='capture-frame'>
        <div>
          <video 
            ref={c => this._video = c} 
            autoPlay 
            src={this.state.src}
            style={style}
            onCanPlay={_ => this._onCanPlay()}>
            n/a
          </video>
          <canvas
            ref={c => this._canvas = c} 
            style={{display: 'none'}}/>
          <img 
            ref={c => this._img = c}
            src='http://placehold.it/400x300'
            style={style}/>
        </div>
        <div className='capture-controls'>
          <button 
            ref={c => this._captureButton = c}
            onClick={_ => this._onCaptureButtonClick()}>
            Capture
          </button>
        </div>
      </div>
    )
  }
}
