# IoT Lab Showcase

A personal portfolio website built to document and present hands-on IoT projects across home automation, sensor data logging, and analytics.

## Project Overview

IoT Lab Showcase is a student-built project by **Rhundei Zen Ballesteros** that combines software and hardware workflows into one portfolio platform.

The repository includes:

- A frontend dashboard for viewing IoT readings and lab outputs
- A backend API for receiving and storing telemetry data
- Arduino sketches for physical sensor-based experiments

The goal is to demonstrate practical IoT engineering skills end-to-end, from device data capture to cloud-backed visualization.

## Live Demo

Live site: **[Add your deployed URL here]**

## Project Structure

```text
iot-lab-showcase/
├── frontend/   # Vite + React portfolio UI and dashboard views
├── backend/    # Express API for receiving and storing IoT readings
├── arduino/    # Arduino sketches for IoT lab hardware simulations
└── README.md   # Project documentation and setup guide
```

## IoT Labs

| Lab Number | Lab Name | Status | Description |
| --- | --- | --- | --- |
| 01 | Server Room Simulation | Active | Simulated server room monitor using a DHT11 sensor, buzzer, and red LED. Alerts are triggered when temperature exceeds the configured threshold. |
| 02 | TBA | Coming Soon | TBA |
| 03 | TBA | Coming Soon | TBA |
| 04 | TBA | Coming Soon | TBA |

## Tech Stack

### Frontend

- Vite + React
- Supabase JS
- Boxicons
- Prism.js

### Backend

- Node.js
- Express

### Database

- Supabase PostgreSQL
- Supabase Realtime

## Getting Started

### 1) Set Up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend development server:

```bash
npm run dev
```

### 2) Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` and add:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the backend server:

```bash
node app.js
```

### 3) Upload the Arduino Sketch

1. Navigate to the relevant lab folder inside `arduino/`.
2. Open the `.ino` sketch file that matches the folder name in the Arduino IDE.
3. Update network and backend connection settings in the sketch:
   - `ssid`
   - `password`
   - `serverIp` (IP address of the machine running the backend)
4. Select the correct board and serial port.
5. Upload the sketch and use Serial Monitor to verify readings and HTTP POST activity.

## Hardware Setup

If you want to replicate the physical build, check the pin configuration and wiring notes in:

- `arduino/server_room_simulation/README.md`

This file contains the full wiring table and breadboard setup guide for replicating the hardware.

## License

This project is released under the [MIT License](LICENSE).
