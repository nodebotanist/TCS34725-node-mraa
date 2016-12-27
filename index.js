'use strict'

const mraa = require('mraa')

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

setTimeout(() => {
    // check status -- register 0x93, value should be 0x11
    let sensorStatus = colorSensor.readReg(0x93)
    console.log('Sensor status: ', sensorStatus)
    if (sensorStatus !== 0x11) {
        throw new Error("Could not start TCS34725")
    } else {
        console.log('Started!')
    }
}, 200)
