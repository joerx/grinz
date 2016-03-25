import assert from 'assert'

/**
 * Helper class to draw things onto a given canvas element.
 */
export default class CanvasEditor {

  constructor(canvas) {
    this._canvas = canvas
    this._context = canvas.getContext('2d')
  }

  /**
   * Draw an image from given source onto the canvas
   */
  drawImage(source, options) {
    assert(options, 'options are missing')
    assert(options.width, 'need width')
    assert(options.height, 'need height')
    this._context.drawImage(source, 0, 0, options.width, options.height)
  }

  /**
   * Draws a filled rectangle over the full size of the canvas. Pass in an rgba color to get a 
   * transparent overlay.
   */
  overlay(options) {
    options = options || {}
    const color = options.color || 'rgba(200, 200, 200, 0.5)'
    const [w, h] = [this._canvas.width, this._canvas.height]
    this._context.fillStyle = color
    this._context.fillRect(0, 0, w, h)
  }

  /**
   * Draw a stroked poly defined by given array vertices. Optional label will be drawn into the 
   * poly
   */
  drawBoundingPoly(vertices, options) {
    options = options || {}

    const color = options.color || '#000'
    const label = options.label || null
    const context = this._context

    let v0, v, i

    v0 = vertices[0]
    context.beginPath()
    context.moveTo(v0.x, v0.y)

    for(i = 1; i < vertices.length; i++) {
      v = vertices[i]
      context.lineTo(v.x, v.y)
    }

    context.lineTo(v0.x, v0.y)
    context.strokeStyle = color
    context.stroke()

    if (label) {
      context.textAlign = 'left'
      context.fillStyle = color
      context.font = '10px serif'
      context.fillText(label.toLowerCase(), v0.x + 3, v0.y + 11)
    }
  }

  /**
   * Draw a mark onto the canvas. Mark will be a small stroked circle with a 3px radius. 
   * Optional label will be rendered near the mark.
   */
  drawMark(position, options) {
    options = options || {}

    const color = options.color || '#000'
    const label = options.label || null
    const context = this._context

    context.strokeStyle = color
    context.fillStyle = color

    context.beginPath()
    context.arc(position.x, position.y, 3, 0, 2*Math.PI, true)
    context.stroke()

    if (label) {
      context.textAlign = 'center'
      context.fillText(label.toLowerCase(), position.x, position.y + 11)
    }
  }
}
