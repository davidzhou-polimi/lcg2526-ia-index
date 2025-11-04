let droneAlfa, droneBravo, droneCharlie;
let minX, maxX, minY, maxY, minZ, maxZ;
let rangeX, rangeY, rangeZ, maxRange;
let minTimestamp, maxTimestamp;
let worldSize;
let maxSteps;

// UI elements
let menuDiv, menuHeight, menuMarginX;
let timeControlDiv, timeSlider;
let droneSelect;
let showReferenceAxes = false;
let axesCheckbox;
let font;
let syncDrones = false; // Set to true to sync drones by step index
let syncCheckbox;

// Animation control
let playPauseButton;
let speedRadio;
let isPlaying = false;
let speedMultiplier = 1.0;

function preload() {
    droneAlfa = loadTable("dataset/drone_alfa_data.csv", "csv", "header");
    droneBravo = loadTable("dataset/drone_bravo_data.csv", "csv", "header");
    droneCharlie = loadTable("dataset/drone_charlie_data.csv", "csv", "header");

    font = loadFont("assets/open-sans.ttf");
}

function setup() {
    worldSize = 400;

    // * Define geographical boundaries *
    // Using destructuring assignment to set min and max for x, y, z positions
    ({ min: minX, max: maxX } = getMinMaxValues("x_pos"));
    // WebGL Y axis is inverted compared to typical Cartesian coordinates
    ({ min: minZ, max: maxZ } = getMinMaxValues("y_pos"));
    ({ min: minY, max: maxY } = getMinMaxValues("z_pos"));

    console.log(`X Position - Min: ${minX}, Max: ${maxX}`);
    console.log(`Y Position - Min: ${minZ}, Max: ${maxZ}`);
    console.log(`Z Position - Min: ${minY}, Max: ${maxY}`);

    // Calculate ranges for each axis
    rangeX = maxX - minX;
    rangeY = maxY - minY;
    rangeZ = maxZ - minZ;

    // Determine the maximum range among x, y, z for scaling purposes
    maxRange = max(rangeX, rangeY, rangeZ);

    // * Define time boundaries *
    maxSteps = max(droneAlfa.getRowCount(), droneBravo.getRowCount(), droneCharlie.getRowCount());
    ({ min: minTimestamp, max: maxTimestamp } = getMinMaxValues("timestamp"));

    console.log(`Timestamp - Min: ${minTimestamp}, Max: ${maxTimestamp}`);

    createCanvas(windowWidth, windowHeight, WEBGL);
    //debugMode();

    // * User Interface Setup *

    menuHeight = 150;
    menuMarginX = 200;

    menuDiv = createDiv()
        //.position(0, height - menuHeight)
        //.style("width", width + "px")
        //.style("height", menuHeight + "px")
        .style("display", "flex")
        .style("flex-direction", "column")
        //.style("gap", "20px")
        .style("background-image", "linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)")
        //.style("padding", menuMarginX/4 + "px " + menuMarginX/2 + "px");
        .style("box-sizing", "border-box");

    timeControlDiv = createDiv()
        .style("display", "flex")
        .style("align-items", "center");

    if (syncDrones) {
        timeSlider = createSlider(0, maxSteps - 1, 0, 0)
            //.position(80, height - 80).style("width", width - 160 + "px");
    } else { 
        // The step size is set to 0 to allow for floating point values
        timeSlider = createSlider(minTimestamp, maxTimestamp, minTimestamp, 0)
            //.position(menuMarginX / 2, height - menuHeight * 0.6)
            //.style("width", width - menuMarginX + "px");
    }

    droneSelect = createRadio("droneSelector");
    droneSelect.option("all", "All drones");
    droneSelect.option("alfa", "Drone Alfa");
    droneSelect.option("bravo", "Drone Bravo");
    droneSelect.option("charlie", "Drone Charlie");
    droneSelect.selected("all");    // Default
    droneSelect.style("display", "flex");
    //droneSelect.position(menuMarginX / 2, height - menuHeight * 0.4);

    syncCheckbox = createCheckbox("Sync Drones", syncDrones);
    syncCheckbox.changed(updateSyncMode);

    axesCheckbox = createCheckbox("Show Reference Axes", false);
    axesCheckbox.changed(toggleAxes);

    let checkboxesDiv = createDiv();
    checkboxesDiv.style("display", "flex");
    checkboxesDiv.style("gap", "10px");
    checkboxesDiv.child(syncCheckbox);
    checkboxesDiv.child(axesCheckbox);

    // * New Play/Pause Button *

    playPauseButton = createButton("Play");
    playPauseButton.mousePressed(togglePlayPause);

    speedRadio = createRadio("speedSelector");
    speedRadio.option("1", "1x");
    speedRadio.option("2", "2x");
    speedRadio.option("4", "4x");
    speedRadio.option("8", "8x");
    speedRadio.selected("1");
    speedRadio.changed(updateSpeed);
    speedRadio.style("display", "flex");

    let otherSettings = createDiv();
    otherSettings.style("display", "flex");
    otherSettings.style("justify-content", "space-between");
    otherSettings.style("gap", "10px");
    otherSettings.child(droneSelect);
    otherSettings.child(checkboxesDiv);

    timeControlDiv.child(playPauseButton);
    timeControlDiv.child(timeSlider);
    timeControlDiv.child(speedRadio);
    menuDiv.child(timeControlDiv);
    menuDiv.child(otherSettings);

    setupMenuSizes();
    updateSpeed();
}

function draw() {
    background("#eaf8ffff");

    // Handle animation playback
    if (isPlaying) {
        if (syncDrones) {
            let baselineStepsPerSecond = 70;
            let stepIncrement = (deltaTime / 1000.0) * baselineStepsPerSecond * speedMultiplier; // Convert deltaTime to seconds
            let newStep = timeSlider.value() + stepIncrement;

            // Loop animation
            if (newStep >= maxSteps - 1) {
                newStep = 0;
            }

            timeSlider.value(newStep); // Use floor to get integer step index
        } else {
            // Assuming timestamps are in seconds, deltaTime is in milliseconds
            let timeIncrement = (deltaTime / 1000.0) * speedMultiplier;
            let newTimestamp = timeSlider.value() + timeIncrement;

            // Loop animation
            if (newTimestamp > maxTimestamp) {
                newTimestamp = minTimestamp;
            }
            
            timeSlider.value(newTimestamp);
        }
    }
    
    if (mouseY < height - menuHeight) {
        orbitControl();
    }

    drawReferenceAxes();

    /*// Draw ground plane
    push();
    translate(0, worldSize, 0);
    rotateX(PI / 2);
    noStroke();
    fill("#796155ff");
    plane(worldSize * 2, worldSize * 2);
    pop();*/

    // * Draw drone paths and current positions *

    let selected = droneSelect.value();
    let currentStep = timeSlider.value();

    if (syncDrones && isPlaying) {
        console.log(currentStep);
    }

    if (selected === "all" || selected === "alfa") {
        drawDronePath(droneAlfa, "cyan");
        if (syncDrones) {
            drawDroneAtStep(droneAlfa, currentStep, "darkcyan");
        } else {
            drawDroneAtTimestamp(droneAlfa, currentStep, "darkcyan");
        }
    }

    if (selected === "all" || selected === "bravo") {
        drawDronePath(droneBravo, "magenta");
        if (syncDrones) {
            drawDroneAtStep(droneBravo, currentStep, "darkmagenta");
        } else {
            drawDroneAtTimestamp(droneBravo, currentStep, "darkmagenta");
        }
    }

    if (selected === "all" || selected === "charlie") {
        drawDronePath(droneCharlie, "gold");
        if (syncDrones) {
            drawDroneAtStep(droneCharlie, currentStep, "darkgoldenrod");
        } else {
            drawDroneAtTimestamp(droneCharlie, currentStep, "darkgoldenrod");
        }
    }

    //noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setupMenuSizes();
}

function getMinMaxValues(columnName) {
    let colAlfa = droneAlfa.getColumn(columnName);
    let colBravo = droneBravo.getColumn(columnName);
    let colCharlie = droneCharlie.getColumn(columnName);

    let allValues = colAlfa.concat(colBravo, colCharlie).map(e => parseFloat(e));
    
    return {
        min: Math.min(...allValues),
        max: Math.max(...allValues)
    }
}

function drawDronePath(droneData, color) {
    push();
    noFill();
    stroke(color);
    strokeWeight(1);
    beginShape();
    for (let r = 0; r < droneData.getRowCount(); r++) {
        let x = map(droneData.getNum(r, "x_pos"), minX, maxX, -worldSize * (rangeX / maxRange), worldSize * (rangeX / maxRange));
        // Y and Z are swapped in WebGL; also Y is inverted
        let y = map(droneData.getNum(r, "z_pos"), minY, maxY, worldSize * (rangeY / maxRange), -worldSize * (rangeY / maxRange));
        let z = map(droneData.getNum(r, "y_pos"), minZ, maxZ, -worldSize * (rangeZ / maxRange), worldSize * (rangeZ / maxRange));

        vertex(x, y, z);
    }
    endShape();
    pop();
}

function drawDroneAtStep(droneData, step, color) {
    let prevStep = Math.floor(step);
    let nextStep = prevStep + 1;
    let t = step - prevStep;

    prevStep = constrain(prevStep, 0, droneData.getRowCount() - 1);
    nextStep = constrain(nextStep, 0, droneData.getRowCount() - 1);

    let x_pos_prev = droneData.getNum(prevStep, "x_pos");
    let y_pos_prev = droneData.getNum(prevStep, "y_pos");
    let z_pos_prev = droneData.getNum(prevStep, "z_pos");
    let x_vel_prev = droneData.getNum(prevStep, "x_vel");
    let y_vel_prev = droneData.getNum(prevStep, "y_vel");

    let x_pos_next = droneData.getNum(nextStep, "x_pos");
    let y_pos_next = droneData.getNum(nextStep, "y_pos");
    let z_pos_next = droneData.getNum(nextStep, "z_pos");
    let x_vel_next = droneData.getNum(nextStep, "x_vel");
    let y_vel_next = droneData.getNum(nextStep, "y_vel");

    let x_pos = lerp(x_pos_prev, x_pos_next, t);
    let y_pos = lerp(y_pos_prev, y_pos_next, t);
    let z_pos = lerp(z_pos_prev, z_pos_next, t);
    let x_vel = lerp(x_vel_prev, x_vel_next, t);
    let z_vel = lerp(y_vel_prev, y_vel_next, t);

    //let x_vel = droneData.getNum(step, "x_vel");
    //let z_vel = droneData.getNum(step, "y_vel");
    let y_vel = 0;

    /*if (step > 0) {
        let prevRow = step - 1;
        let deltaZ = droneData.getNum(step, "z_pos") - droneData.getNum(prevRow, "z_pos");
        let deltaTime = droneData.getNum(step, "timestamp") - droneData.getNum(prevRow, "timestamp");
        if (deltaTime > 0) y_vel = deltaZ / deltaTime;
    }*/

    if (prevStep > 0 && nextStep > prevStep) {
        // Calculate y velocity based on change in altitude between prevStep and nextStep
        
        let prevDeltaZ = droneData.getNum(prevStep, "z_pos") - droneData.getNum(prevStep - 1, "z_pos");
        let prevDeltaT = droneData.getNum(prevStep, "timestamp") - droneData.getNum(prevStep - 1, "timestamp");
        let y_vel_prev_calc = (prevDeltaT > 0) ? prevDeltaZ / prevDeltaT : 0;
        
        let nextDeltaZ = droneData.getNum(nextStep, "z_pos") - droneData.getNum(nextStep - 1, "z_pos");
        let nextDeltaT = droneData.getNum(nextStep, "timestamp") - droneData.getNum(nextStep - 1, "timestamp");
        let y_vel_next_calc = (nextDeltaT > 0) ? nextDeltaZ / nextDeltaT : 0;
        
        y_vel = lerp(y_vel_prev_calc, y_vel_next_calc, t);

    } else if (prevStep > 0) {
        // Fallback if last step
        let deltaZ = droneData.getNum(prevStep, "z_pos") - droneData.getNum(prevStep - 1, "z_pos");
        let deltaTime = droneData.getNum(prevStep, "timestamp") - droneData.getNum(prevStep - 1, "timestamp");
        if (deltaTime > 0) y_vel = deltaZ / deltaTime;
    }

    let totalSpeed = mag(x_vel, y_vel, z_vel);
    let baseRadius = 10;
    let speedFactor = 1 + totalSpeed * 0.5;
    let radiusZ = baseRadius * speedFactor;
    let radiusX = baseRadius / speedFactor;
    let radiusY = baseRadius / speedFactor;

    let yaw = atan2(x_vel, z_vel);
    let horizontalSpeed = mag(x_vel, z_vel);
    let pitch = atan2(-y_vel, horizontalSpeed);

    /*let x = map(droneData.getNum(step, "x_pos"), minX, maxX, -worldSize * (rangeX / maxRange), worldSize * (rangeX / maxRange));
    let y = map(droneData.getNum(step, "z_pos"), minY, maxY, worldSize * (rangeY / maxRange), -worldSize * (rangeY / maxRange));
    let z = map(droneData.getNum(step, "y_pos"), minZ, maxZ, -worldSize * (rangeZ / maxRange), worldSize * (rangeZ / maxRange));*/

    let x = map(x_pos, minX, maxX, -worldSize * (rangeX / maxRange), worldSize * (rangeX / maxRange));
    let y = map(z_pos, minY, maxY, worldSize * (rangeY / maxRange), -worldSize * (rangeY / maxRange));
    let z = map(y_pos, minZ, maxZ, -worldSize * (rangeZ / maxRange), worldSize * (rangeZ / maxRange));

    /*let realX = droneData.getNum(step, "x_pos");
    let realY_data = droneData.getNum(step, "y_pos");
    let realZ_alt = droneData.getNum(step, "z_pos");
    let label = `X: ${nfc(realX, 2)}\nY: ${nfc(realY_data, 2)}\nAlt: ${nfc(realZ_alt, 2)}`;*/
    let label = `X: ${nfc(x_pos, 2)}\nY: ${nfc(y_pos, 2)}\nAlt: ${nfc(z_pos, 2)}`;

    push();
    translate(x, y, z);

    push();
    rotateY(yaw);
    rotateX(pitch);
    fill(color);
    noStroke();
    ellipsoid(radiusX, radiusY, radiusZ);
    pop();

    if (font) textFont(font);
    textSize(8);
    fill(0);
    noStroke();
    textAlign(CENTER, BOTTOM);
    text(label, 0, -15);

    pop();
}

function drawDroneAtTimestamp(droneData, timestamp, color) {
    let targetRow = 0;

    for (let r = 0; r < droneData.getRowCount(); r++) {
        let rowTime = droneData.getNum(r, "timestamp");
        
        if (rowTime >= timestamp) {
            targetRow = r;
            break;
        }
        
        targetRow = r; 
    }

    let x_vel = droneData.getNum(targetRow, "x_vel");
    // WebGL Z vel (forward/backward)
    let z_vel = droneData.getNum(targetRow, "y_vel");
    // WebGL Y vel (up/down)
    let y_vel = 0;

    // Calculate y velocity based on change in altitude if not the first row
    if (targetRow > 0) {
        let prevRow = targetRow - 1;
        
        // Calculate change in altitude and time
        let deltaZ = droneData.getNum(targetRow, "z_pos") - droneData.getNum(prevRow, "z_pos");
        let deltaTime = droneData.getNum(targetRow, "timestamp") - droneData.getNum(prevRow, "timestamp");

        // Avoid division by zero
        if (deltaTime > 0) {
            y_vel = deltaZ / deltaTime;
        }
    }

    let totalSpeed = mag(x_vel, y_vel, z_vel);
    let baseRadius = 10;
    let speedFactor = 1 + totalSpeed * 0.5;

    // Scale the ellipsoid in the z direction based on speed
    let radiusZ = baseRadius * speedFactor;
    // and flatten the ellipsoid in the xy direction
    let radiusX = baseRadius / speedFactor;
    let radiusY = baseRadius / speedFactor;

    // Left/right rotation based on x and z velocity
    let yaw = atan2(x_vel, z_vel);

    // Calculate horizontal speed for pitch calculation
    let horizontalSpeed = mag(x_vel, z_vel);
    // Up/down rotation based on y velocity
    let pitch = atan2(-y_vel, horizontalSpeed);

    let x = map(droneData.getNum(targetRow, "x_pos"), minX, maxX, -worldSize * (rangeX / maxRange), worldSize * (rangeX / maxRange));
    let y = map(droneData.getNum(targetRow, "z_pos"), minY, maxY, worldSize * (rangeY / maxRange), -worldSize * (rangeY / maxRange));
    let z = map(droneData.getNum(targetRow, "y_pos"), minZ, maxZ, -worldSize * (rangeZ / maxRange), worldSize * (rangeZ / maxRange));

    // Prepare label with real-world coordinates
    let realX = droneData.getNum(targetRow, "x_pos");
    let realY_data = droneData.getNum(targetRow, "y_pos"); // This is data "Y"
    let realZ_alt = droneData.getNum(targetRow, "z_pos"); // This is data "Z" (altitude)
    let label = `X: ${nfc(realX, 2)}\nY: ${nfc(realY_data, 2)}\nAlt: ${nfc(realZ_alt, 2)}`;

    push();
    translate(x, y, z);

    push(); // Drone body
    rotateY(yaw);
    rotateX(pitch);

    fill(color);
    noStroke();
    ellipsoid(radiusX, radiusY, radiusZ);
    pop();

    // Draw label above the drone
    if (font) textFont(font);

    textSize(8);
    fill(0); // Black text
    noStroke();
    textAlign(CENTER, BOTTOM); // Align text to be centered
    
    // Draw the text
    text(label, 0, -15);

    pop();
}

function setupMenuSizes() {
    menuDiv
        .position(0, height - menuHeight)
        .style("width", width + "px")
        .style("height", menuHeight + "px")
        .style("gap", "20px")
        .style("padding", menuMarginX/4 + "px " + menuMarginX/2 + "px");

    timeSlider.style("width", 100 + "%");

    timeControlDiv
        .style("width", width - menuMarginX + "px")
        .style("gap", "20px");

    speedRadio.style("gap", "10px");

    playPauseButton
        .style("width", "80px")

    droneSelect.style("gap", "10px");
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playPauseButton.html("Pause");
    } else {
        playPauseButton.html("Play");
    }
}

function updateSpeed() {
    speedMultiplier = parseFloat(speedRadio.value());
}

function drawReferenceAxes() {
    push();

    let axisLength = worldSize;
    let stepCount = 10; // Number of steps/ticks per side
    let worldTickStep = worldSize / stepCount;
    let tickSize = 10;

    // * Reference grid (Y=0 Plane) *

    stroke(150, 150, 150, 100); 
    strokeWeight(0.2);
    noFill();
    for (let i = -stepCount; i <= stepCount; i++) {
        let pos = i * worldTickStep;
        // Lines parallel to Z-axis (along X)
        line(-axisLength, 0, pos, axisLength, 0, pos);
        // Lines parallel to X-axis (along Z)
        line(pos, 0, -axisLength, pos, 0, axisLength);
    }

    if (showReferenceAxes === false) {
        pop();
        return;
    }

    // * Axes *

    //rotateX(PI / 2); // Rotate to match ground plane orientation
    strokeWeight(0.5);

    if (font) textFont(font);

    textSize(8);
    textAlign(CENTER, CENTER);

    // X-Axis (Red) - Corresponds to x_pos
    stroke(255, 0, 0, 150);
    fill(255, 0, 0);
    line(-axisLength, 0, 0, axisLength, 0, 0);
    for (let i = -stepCount; i <= stepCount; i++) {
        let x = i * worldTickStep;
        if (x === 0) continue;
        line(x, -tickSize, 0, x, tickSize, 0); // Tick mark

        let dataX = map(x, -worldSize * (rangeX / maxRange), worldSize * (rangeX / maxRange), minX, maxX);

        push();
        translate(x, 20, 0); // Label offset
        noStroke();
        text(nfc(dataX, 2), 0, 0); // nfc formats the number
        pop();
    }
    push();
    translate(axisLength + 40, 0, 0); // Axis label
    noStroke();
    text("X (x_pos)", 0, 0);
    pop();


    // Y-Axis (Green) - Corresponds to z_pos (Altitude)
    // NOTE: +Y in WEBGL is DOWN, -Y is UP
    stroke(0, 255, 0, 150);
    fill(0, 255, 0);
    line(0, -axisLength, 0, 0, axisLength, 0); // -Y is UP, +Y is DOWN
    for (let i = -stepCount; i <= stepCount; i++) {
        let y = i * worldTickStep;
        if (y === 0) continue;
        line(-tickSize, y, 0, tickSize, y, 0); // Tick mark

        let dataZ = map(y, worldSize * (rangeY / maxRange), -worldSize * (rangeY / maxRange), minY, maxY);

        push();
        translate(20, y, 0); // Label offset
        noStroke();
        text(nfc(dataZ, 2), 0, 0);
        pop();
    }
    push();
    translate(0, -axisLength - 20, 0); // Label at the top (negative Y)
    noStroke();
    text("Altitude (z_pos)", 0, 0);
    pop();


    // Z-Axis (Blue) - Corresponds to y_pos
    stroke(0, 0, 255, 150);
    fill(0, 0, 255);
    line(0, 0, -axisLength, 0, 0, axisLength);
    for (let i = -stepCount; i <= stepCount; i++) {
        let z = i * worldTickStep;
        if (z === 0) continue;
        line(-tickSize, 0, z, tickSize, 0, z); // Tick mark

        let dataY = map(z, -worldSize * (rangeZ / maxRange), worldSize * (rangeZ / maxRange), minZ, maxZ);

        push();
        translate(0, 20, z); // Label offset
        noStroke();
        text(nfc(dataY, 2), 0, 0);
        pop();
    }
    push();
    translate(0, 0, axisLength + 40); // Axis label
    noStroke();
    text("Z (y_pos)", 0, 0);
    pop();
    pop();
}

function toggleAxes() {
    showReferenceAxes = this.checked();
}

function updateSyncMode() {
    syncDrones = this.checked();
    timeSlider.remove();

    if (syncDrones) {
        timeSlider = createSlider(0, maxSteps - 1, 0, 0);
    } else {
        timeSlider = createSlider(minTimestamp, maxTimestamp, minTimestamp, 0);
    }

    timeSlider.style("width", 100 + "%");
    timeControlDiv.child(timeSlider);

    // Reorder children to keep layout
    timeControlDiv.child(playPauseButton);
    timeControlDiv.child(timeSlider);
    timeControlDiv.child(speedRadio);
}