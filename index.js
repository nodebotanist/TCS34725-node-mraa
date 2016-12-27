'use strict'

const mraa = require('mraa')

const colorSensor = new mraa.I2c(1)

colorSensor.address(0x29)

let idRegValue = colorSensor.readReg(0x92)

console.log(idRegValue)