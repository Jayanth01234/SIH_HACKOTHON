# POLARIS — Live Demonstration Walkthrough Script
**Problem Statement ID:** 26060  
**Title:** Digital Platform for Efficient Remote Management of Indian Antarctic Research Stations  
**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)  
**Theme:** Smart Automation | **Team:** InnoByte  

---

## 5-Minute Evaluation Demo Flow

### 1. Welcome & Operational Philosophy (0:00 - 0:45)
1. Open the POLARIS Mission Control Console (`http://localhost:5173`).
2. Point out the top header:
   - **Station Switcher:** Instant switching between **Maitri** (Queen Maud Land, commissioned 1989) and **Bharati** (Larsemann Hills, commissioned 2012).
   - **Data Mode Indicator:** Clearly distinguishes `LIVE`, `PUBLIC LIVE`, `SIMULATION`, `HISTORICAL`, and `OFFLINE`.
   - **Coordinated Universal Time (UTC):** Antarctic operations run strictly on UTC.
   - **Engine Health & WebSocket Beacon:** Proves active real-time data streaming without manual page reloads.

### 2. Unified Digital Twin Centerpiece (0:45 - 1:45)
1. Direct attention to the **Operational Digital Twin Dependency Model** at the top of the dashboard:
   - Shows all 4 interconnected pillars: **Environment → Infrastructure → Microgrid → Logistics**.
   - Note how each pillar dynamically displays active telemetry:
     - **Environment:** Wind speed, temperature, pressure trend arrow.
     - **Infrastructure:** Composite health score (94%), SatCom tracking, lake pump trace heating status.
     - **Microgrid:** Total kW consumption, DG generation load, BESS battery state of charge (SoC).
     - **Logistics:** Days of fuel endurance remaining, rations buffer, resupply window countdown.
2. Emphasize to the judges:
   > *"POLARIS is not a passive dashboard. It is an operational decision-support Digital Twin where every physical parameter is mathematically correlated."*

### 3. Automated 12-Step Demo Scenario — "Severe Weather at Maitri" (1:45 - 3:00)
1. Click the prominent **`RUN DEMO SCENARIO`** button in the top header.
2. Watch the system execute the end-to-end chain transparently:
   - **Step 1-2:** Katabatic wind begins accelerating (14.5 m/s → 19.8 m/s); barometer plunges by -1.4 hPa/hr.
   - **Step 3-4:** ML Hazard Engine spikes risk probability (0.74 → 0.88), classifying the event as **CRITICAL**. Explainable drivers highlight barometric decline rate as the #1 factor.
   - **Step 5-6:** Infrastructure guy-wire stress climbs to 68%; microgrid heating demand surges by +28.5 kW; secondary diesel generator DG-02 auto-synchronizes.
   - **Step 7:** Cross-Domain Impact Engine traces causal consequences: Fuel autonomy decreases by 4.2 days.
   - **Step 8:** Alert `ALT-M-901` (*Class 3 Blizzard Lockdown Required*) appears in the Active Alerts panel with high-priority audio-visual cue.
   - **Step 9-10:** Operator clicks **Acknowledge**, inputs: *"Blizzard SOP-01 Class 3 executed. Secondary DG-02 online. Traverses halted."*
   - **Step 11-12:** The action is permanently recorded into the **Mission Audit Timeline**, and the Digital Twin stabilizes.

### 4. Interactive "What-If" Stress Test Simulator (3:00 - 3:45)
1. Navigate to **What-If Simulator** from the sidebar.
2. Move the sliders:
   - Wind Velocity: `+35%`
   - Ambient Temperature: `-8°C`
   - Barometric Pressure: `-15 hPa`
   - Fuel Reserve: `-20%`
3. Click **Simulate State Change**:
   - The engine recalculates physical loads in real time (not a pre-recorded animation).
   - Show the **Current State vs Simulated State** table:
     - Energy consumption jumps from 54 kW to 78 kW.
     - Fuel autonomy drops from 38 days to 21 days.
     - Emergent alert warning for fuel threshold breach is generated.

### 5. Antarctic Map Twin & Station Comparison (3:45 - 4:15)
1. Click **Antarctic Map Twin**:
   - Displays accurate polar azimuthal projection showing the geographical positions of Maitri and Bharati.
   - Click Bharati to switch station focus.
2. Open **Station Comparison**:
   - Compares coastal Larsemann Hills (Bharati) vs inland Schirmacher Oasis (Maitri).
   - Contrasts architectural differences (Bharati's automated containerized complex vs Maitri's hydronic lake trace heating).

### 6. Offline / Satellite Blackout & Auto-Sync (4:15 - 5:00)
1. Click the **ONLINE** badge in the header:
   - Immediately switches to **OFFLINE** mode.
   - Notice that the dashboard remains completely responsive, serving the cached **Last-Known-Good** state from local persistence.
   - Any new telemetry packets are queued in the offline buffer.
2. Click the badge again to **Restore Connection**:
   - The system displays *"Synchronizing queued packets..."*
   - Telemetry syncs seamlessly with central archive.
3. Conclude with the mission statement:
   > *"POLARIS provides MoES and NCPOR with a unified, explainable, and resilient remote operations command twin for India's scientific presence in Antarctica."*
