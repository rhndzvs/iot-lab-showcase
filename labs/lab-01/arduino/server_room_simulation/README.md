# Server Room Simulation Hardware Guide

This guide explains the wiring and breadboard layout for Lab 01: Server Room Simulation.

## Components

- Arduino Uno WiFi R4
- DHT11 temperature and humidity sensor
- Piezo buzzer (active or passive)
- Red LED
- 220 ohm resistor (for LED current limiting)
- Jumper wires
- Breadboard

## Wiring Table

| Component | Signal/Pin | Connect To Arduino | Notes |
| --- | --- | --- | --- |
| DHT11 | VCC | 5V | Power for sensor |
| DHT11 | GND | GND | Common ground |
| DHT11 | DATA | D2 | Matches `#define DHTPIN 2` in sketch |
| Piezo buzzer | + | D8 | Matches `BUZZER_PIN = 8` |
| Piezo buzzer | - | GND | Common ground |
| Red LED | Anode (+) | D7 through 220 ohm resistor | Matches `LED_PIN = 7` |
| Red LED | Cathode (-) | GND | Common ground |

## Breadboard Setup

1. Connect Arduino 5V to the breadboard positive rail.
2. Connect Arduino GND to the breadboard ground rail.
3. Place the DHT11 on the breadboard and wire VCC, GND, and DATA.
4. Place the red LED on the breadboard:
   - Long leg (anode) goes to D7 through a 220 ohm resistor.
   - Short leg (cathode) goes to ground rail.
5. Connect the buzzer:
   - Positive terminal to D8.
   - Negative terminal to ground rail.
6. Verify all ground connections are shared (sensor, buzzer, LED, Arduino).

## Firmware Pin Reference

These are the pins used in `server_room_simulation.ino`:

- DHT11 data pin: D2
- LED pin: D7
- Buzzer pin: D8

## Verification Checklist

- Power on board and open Serial Monitor at 9600 baud.
- Confirm periodic temperature and humidity readings appear.
- Heat the DHT11 slightly (for example, warm air from your hand) to test threshold behavior.
- Confirm LED turns on and buzzer sounds when temperature exceeds the threshold.
- Confirm backend receives POST data when Wi-Fi and server IP are configured.

## Troubleshooting

- No sensor values: recheck DHT11 DATA wiring and pin number in code.
- LED not lighting: check resistor placement, LED polarity, and D7 connection.
- No buzzer sound: verify buzzer polarity and D8 connection.
- No backend data: verify Wi-Fi credentials, local server IP, and backend port.
