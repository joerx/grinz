import React from 'react'
import {join} from 'path'
import {getUserMedia, createObjectURL} from './adapters'
import dataURLtoBlob from './data-url-to-blob'
import CanvasEditor from './canvas-editor'

const RANK = [
  'VERY_LIKELY',
  'LIKELY',
  'POSSIBLE',
  'UNLIKELY',
  'VERY_UNLIKELY'
]

const EMOTIONS = {
  'joy': 'img/joy.png', 
  'sorrow': 'img/sorrow.png',
  'anger': 'img/anger.png',
  'surprise': 'img/surprise.png'
}

const IMG_SERVER_URL = 'http://localhost:5000'

function uploadImage(blob) {
  let headers = {
    'Content-Type': blob.type,
    'Content-Length': blob.length
  }

  let opts = {
    method: 'post',
    mode: 'cors',
    redirect: 'follow',
    headers: headers,
    body: blob
  }

  return fetch(IMG_SERVER_URL + '/vision', opts).then(res => res.json())
}

function findMostLikelyEmotion(res) {
  return Object.keys(EMOTIONS)
    .filter(e => {
      const rank = RANK.indexOf(res[`${e}Likelihood`])
      return rank > 0 && rank < RANK.indexOf('UNLIKELY')
    })
    .sort((a, b) => {
      return RANK.indexOf(res[`${a}Likelihood`]) - RANK.indexOf(res[`${b}Likelihood`])
    })[0]
}

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

class CaptureFrame extends React.Component {

  constructor(props) {
    super()
    this.state = {
      src: null, 
      canCapture: false, 
      width: 400, 
      height: 300,
      detectedEmotion: null
    }
  }

  componentDidMount() {
    getUserMedia(
      {audio: false, video: true},
      stream => this.setState({src: createObjectURL(stream)}),
      err => console.log('Please allow to use the camera!')
    )
  }

  _captureClick() {
    this._capturePhoto()
  }

  _canPlay() {
    let [vw, vh] = [this._video.videoWidth, this._video.videoHeight]
    let [w, h] = [this.state.width, this.state.width * vh/vw]
    this.setState({canCapture: true, width: w, height: h})
  }

  _drawWireframe(data) {
    const editor = new CanvasEditor(this._canvas)
    const res = data[0]
    const showMarks = [
      'LEFT_EYE',
      'RIGHT_EYE',
      'MOUTH_CENTER',
      'LEFT_EAR_TRAGION',
      'RIGHT_EAR_TRAGION',
      'NOSE_TIP'
    ]

    editor.drawImage(this._imgBuf, {width: this.state.width, height: this.state.height})
    editor.overlay()
    editor.drawBoundingPoly(res.boundingPoly.vertices, {label: 'boundingPoly', color: 'green'})
    editor.drawBoundingPoly(res.fdBoundingPoly.vertices, {label: 'fdBoundingPoly', color: 'blue'})

    let i, lm
    for(i = 0; i < res.landmarks.length; i++) {
      lm = res.landmarks[i]
      if (showMarks.indexOf(lm.type) < 0) continue
      editor.drawMark(lm.position, {label: lm.type, color: 'red'})
    }

    let emo = findMostLikelyEmotion(res)
    console.log(emo)

    this.setState({detectedEmotion: emo || null})
  }

  _capturePhoto() {
    let context = this._canvas.getContext('2d')
    context.drawImage(this._video, 0, 0, this.state.width, this.state.height)
  
    let dataURL = this._canvas.toDataURL('image/png')
    let binData = dataURLtoBlob(dataURL)
    uploadImage(binData)
      .then(data => this._drawWireframe(data))
      .catch(err => console.error(err))

    this._imgBuf.setAttribute('src', dataURL)
  }

  render() {
    const style = {backgroundColor: 'black'}
    const emoji = this.state.detectedEmotion ? 
      EMOTIONS[this.state.detectedEmotion] :
      'img/unknown.png'

    return (
      <div className='capture-frame'>
        <div>
          <video 
            ref={c => this._video = c} 
            autoPlay 
            src={this.state.src}
            width={this.state.width}
            height={this.state.height}
            onCanPlay={_ => this._canPlay()}>
            n/a
          </video>
          <img 
            ref={c => this._imgBuf = c} 
            width={this.state.width} 
            height={this.state.height}
            style={{display: 'none'}}/>
          <canvas 
            ref={c => this._canvas = c}
            width={this.state.width} 
            height={this.state.height}/>
        </div>
        <div className='capture-controls'>
          <button 
            onClick={_ => this._captureClick()} 
            disabled={!this.state.canCapture}>Capture
          </button>
        </div>
        <div>
          <img src={emoji} width={100} height={100} />
        </div>
      </div>
    )
  }
}
