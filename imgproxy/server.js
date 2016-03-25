'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const request = require('request')
const assert = require('assert')
const cors = require('cors')

assert(process.env.VISION_API_KEY, 'VISION_API_KEY must be set')

const VISION_API_KEY = process.env.VISION_API_KEY

const app = express()
app.use(bodyParser.json())
app.use(cors())

let sample = [{"boundingPoly":{"vertices":[{"x":81,"y":67},{"x":262,"y":67},{"x":262,"y":278},{"x":81,"y":278}]},"fdBoundingPoly":{"vertices":[{"x":102,"y":122},{"x":235,"y":122},{"x":235,"y":255},{"x":102,"y":255}]},"landmarks":[{"type":"LEFT_EYE","position":{"x":141.95914,"y":164.35719,"z":-0.0012003761}},{"type":"RIGHT_EYE","position":{"x":198.87898,"y":161.25456,"z":-0.96658814}},{"type":"LEFT_OF_LEFT_EYEBROW","position":{"x":122.97132,"y":153.2269,"z":5.4241056}},{"type":"RIGHT_OF_LEFT_EYEBROW","position":{"x":155.09581,"y":150.67387,"z":-10.911086}},{"type":"LEFT_OF_RIGHT_EYEBROW","position":{"x":181.58727,"y":148.739,"z":-11.387534}},{"type":"RIGHT_OF_RIGHT_EYEBROW","position":{"x":214.15309,"y":146.57309,"z":3.7830346}},{"type":"MIDPOINT_BETWEEN_EYES","position":{"x":169.16534,"y":161.25732,"z":-11.931652}},{"type":"NOSE_TIP","position":{"x":171.00856,"y":191.73718,"z":-27.885071}},{"type":"UPPER_LIP","position":{"x":172.67673,"y":212.82307,"z":-15.129349}},{"type":"LOWER_LIP","position":{"x":174.2027,"y":230.96729,"z":-11.137702}},{"type":"MOUTH_LEFT","position":{"x":153.73445,"y":222.53366,"z":-0.45137897}},{"type":"MOUTH_RIGHT","position":{"x":194.86256,"y":218.27835,"z":-0.7793498}},{"type":"MOUTH_CENTER","position":{"x":173.60483,"y":221.40918,"z":-11.01903}},{"type":"NOSE_BOTTOM_RIGHT","position":{"x":186.3978,"y":195.23505,"z":-7.22671}},{"type":"NOSE_BOTTOM_LEFT","position":{"x":157.50658,"y":197.44356,"z":-6.7878056}},{"type":"NOSE_BOTTOM_CENTER","position":{"x":171.72894,"y":200.65637,"z":-15.368649}},{"type":"LEFT_EYE_TOP_BOUNDARY","position":{"x":141.86734,"y":161.0435,"z":-3.6801527}},{"type":"LEFT_EYE_RIGHT_CORNER","position":{"x":150.46031,"y":164.3363,"z":0.18459082}},{"type":"LEFT_EYE_BOTTOM_BOUNDARY","position":{"x":142.31422,"y":168.59285,"z":-0.42972326}},{"type":"LEFT_EYE_LEFT_CORNER","position":{"x":131.45482,"y":165.67453,"z":5.2271366}},{"type":"LEFT_EYE_PUPIL","position":{"x":141.29341,"y":164.84149,"z":-1.2630632}},{"type":"RIGHT_EYE_TOP_BOUNDARY","position":{"x":196.4659,"y":157.09439,"z":-4.632493}},{"type":"RIGHT_EYE_RIGHT_CORNER","position":{"x":207.70502,"y":160.20874,"z":3.9136827}},{"type":"RIGHT_EYE_BOTTOM_BOUNDARY","position":{"x":198.24507,"y":165.01956,"z":-1.3488507}},{"type":"RIGHT_EYE_LEFT_CORNER","position":{"x":186.24748,"y":162.17285,"z":-0.5175271}},{"type":"RIGHT_EYE_PUPIL","position":{"x":197.29559,"y":160.8018,"z":-2.3463407}},{"type":"LEFT_EYEBROW_UPPER_MIDPOINT","position":{"x":138.34435,"y":145.31017,"z":-6.3707967}},{"type":"RIGHT_EYEBROW_UPPER_MIDPOINT","position":{"x":197.51508,"y":141.00484,"z":-7.3945646}},{"type":"LEFT_EAR_TRAGION","position":{"x":110.58558,"y":193.80228,"z":68.180389}},{"type":"RIGHT_EAR_TRAGION","position":{"x":234.46283,"y":184.89661,"z":65.970757}},{"type":"FOREHEAD_GLABELLA","position":{"x":168.24113,"y":149.04596,"z":-13.200602}},{"type":"CHIN_GNATHION","position":{"x":176.19302,"y":255.69931,"z":-3.2909994}},{"type":"CHIN_LEFT_GONION","position":{"x":118.74728,"y":228.4805,"z":45.799507}},{"type":"CHIN_RIGHT_GONION","position":{"x":230.6689,"y":220.3665,"z":43.848949}}],"rollAngle":-4.1630197,"panAngle":-0.99216473,"tiltAngle":-0.015149753,"detectionConfidence":0.89606655,"landmarkingConfidence":0.36029783,"joyLikelihood":"VERY_UNLIKELY","sorrowLikelihood":"VERY_UNLIKELY","angerLikelihood":"VERY_UNLIKELY","surpriseLikelihood":"LIKELY","underExposedLikelihood":"VERY_UNLIKELY","blurredLikelihood":"VERY_UNLIKELY","headwearLikelihood":"VERY_UNLIKELY"}]

app.post('/vision', (req, res, next) => {
  // return res.status(200).json(sample)
  
  let chunks = []
  let data = null

  req.on('data', chunk => chunks.push(chunk))
  req.on('error', err => next(err))
  req.on('end', _ => {
    data = Buffer.concat(chunks).toString('base64')

    let body = {
      requests: [{
        image: {content: data},
        features: {
          type: 'FACE_DETECTION',
          maxResults: 10
        }
      }]
    }

    let url = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`
    request(url, {method: 'post', json: true, body: body}, (err, visionResponse) => {
      if (err) return next(err)
      let result = visionResponse.body.responses[0].faceAnnotations
      res.status(200).json(result ? result : [])
    })
  })
})

app.use((req, res) => {
  res.status(404).json({message: 'not found'})
})

app.use((err, req, res, next) => {
  res.status(500).json({message: err.message})
})

app.listen(5000, _ => console.log(':5000'))
