'use strict'

const mraa = require('mraa')
const async = require('async')
const Barcli = require('barcli')

const colorSensor = new mraa.I2c(1)

colorSensor.address(0x29)

// check ID register to make sure sensor is plugged in
let idRegValue = colorSensor.readReg(0x92)

if (idRegValue !== 0x44) {
    throw new Error("Cannot find TCS34725!")
}

// set integration time -- register 0x81, value 0xEB
colorSensor.writeReg(0x81, 0xEB)

// set sensor gain -- register 0x8F, value 0x00
colorSensor.writeReg(0x8F, 0x01)

// enable sensor -- register 0x80, value 0x01
// followed by register 0x80, value 0x03
colorSensor.writeReg(0x80, 0x01)
colorSensor.writeReg(0x80, 0x03)

let sensorStatus = null
async.until(
    () => sensorStatus == 0x11,
    (cb) => {
        sensorStatus = colorSensor.readReg(0x93)
        cb(null)
    },
    () => console.log('Started!')
)

let clear, red, green, blue
let clearGraph = new Barcli({
    label: 'clear',
    range: [0, 65335]
})
let redGraph = new Barcli({
    label: 'red',
    range: [0, 255]
})
let greenGraph = new Barcli({
    label: 'green',
    range: [0, 255]
})
let blueGraph = new Barcli({
    label: 'blue',
    range: [0, 255]
})

setInterval(() => {
    // start sampling
    // clear channel-- low byte from 0x14, high from 0x15
    clear = colorSensor.readReg(0x95) << 4
    clear |= colorSensor.readReg(0x94)
    clearGraph.update(clear)

    // red channel-- low byte 0x16, high byte 0x17
    red = colorSensor.readReg(0x97) << 4
    red |= colorSensor.readReg(0x96)
    red = Math.floor((red / clear) * 256)
    redGraph.update(red)

    // green channel-- low byte 0x18, high byte 0x19
    green = colorSensor.readReg(0x89) << 4
    green |= colorSensor.readReg(0x88)
    green = Math.floor((green / clear) * 256)
    greenGraph.update(green)

    // blue channel-- low byte 0x1A, high byte 0x1B
    blue = colorSensor.readReg(0x8B) << 4
    blue |= colorSensor.readReg(0x8A)
    blue = Math.floor((blue / clear) * 256)
    blueGraph.update(blue)
}, 250)