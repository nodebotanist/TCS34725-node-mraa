'use strict'

const mraa = require('mraa')
const async = require('async')
const barcli = require('barcli')

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
colorSensor.writeReg(0x8F, 0x00)

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
setInterval(() => {
    // start sampling
    // clear channel-- low byte from 0x14, high from 0x15
    clear = colorSensor.readReg(0x15) << 4
    clear |= colorSensor.readReg(0x14)
    console.log('Clear: ', clear)

    // red channel-- low byte 0x16, high byte 0x17
    red = colorSensor.readReg(0x17) << 4
    red |= colorSensor.readReg(0x16)
    console.log('Red: ', red)
}, 250)