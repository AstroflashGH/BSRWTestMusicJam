// Settings
const bpm = 120;
const bars = 8;
const beatsInABar = 4;

const drumkit = {
    displayName: "Drumkit",
    noteLabels: ["Kick", "Snare", "Crash", "Clap"],
    samples: [
        new Audio("samples/drums/Drum_Kick.mp3"),
        new Audio("samples/drums/Drum_Snare.mp3"),
        new Audio("samples/drums/Drum_Crash.mp3"),
        new Audio("samples/drums/Drum_Clap.mp3"),
    ],
};

const piano = {
    displayName: "Piano",
    noteLabels: ["B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3"],
    samples: [
        new Audio("samples/piano/piano_b_4.mp3"),
        new Audio("samples/piano/piano_a_sharp_4.mp3"),
        new Audio("samples/piano/piano_a_4.mp3"),
        new Audio("samples/piano/piano_g_sharp_4.mp3"),
        new Audio("samples/piano/piano_g_4.mp3"),
        new Audio("samples/piano/piano_f_sharp_4.mp3"),
        new Audio("samples/piano/piano_f_4.mp3"),
        new Audio("samples/piano/piano_e_4.mp3"),
        new Audio("samples/piano/piano_d_sharp_4.mp3"),
        new Audio("samples/piano/piano_d_4.mp3"),
        new Audio("samples/piano/piano_c_sharp_4.mp3"),
        new Audio("samples/piano/piano_c_4.mp3"),
        new Audio("samples/piano/piano_b_3.mp3"),
        new Audio("samples/piano/piano_a_sharp_3.mp3"),
        new Audio("samples/piano/piano_a_3.mp3"),
        new Audio("samples/piano/piano_g_sharp_3.mp3"),
        new Audio("samples/piano/piano_g_3.mp3"),
        new Audio("samples/piano/piano_f_sharp_3.mp3"),
        new Audio("samples/piano/piano_f_3.mp3"),
        new Audio("samples/piano/piano_e_3.mp3"),
        new Audio("samples/piano/piano_d_sharp_3.mp3"),
        new Audio("samples/piano/piano_d_3.mp3"),
        new Audio("samples/piano/piano_c_sharp_3.mp3"),
        new Audio("samples/piano/piano_c_3.mp3"),
    ],
};

const pianoAndDrumkit = {
    displayName: "Piano and 808 Drums, (120BPM, 4/4, 8 Bars)",
    noteLabels: piano.noteLabels.concat(drumkit.noteLabels),
    samples: piano.samples.concat(drumkit.samples),
};

// Choose the active instrument
const instrument = pianoAndDrumkit;

// Set the instrument name
const instrumentName = document.querySelector("#instrument-name");
instrumentName.textContent = instrument.displayName;

// Create the piano roll
const noteCount = instrument.noteLabels.length;
const pianoRollTimeline = document.querySelector("#piano-roll-timeline");
let dragIsAdding = undefined;
for (let note = 0; note < noteCount; note++) {
    // Create a note row
    const timelineRow = document.createElement("div");
    timelineRow.className = "timeline-row";
    pianoRollTimeline.appendChild(timelineRow);

    // Create green notes on the left side
    const timelineNote = document.createElement("div");
    timelineNote.className = "note";
    
    // Add 'drum' class if it's a drum note (last 4 notes for pianoAndDrumkit)
    if (note >= piano.noteLabels.length) {
        timelineNote.classList.add("drum");
    }
    
    timelineNote.textContent = instrument.noteLabels[note];
    timelineRow.appendChild(timelineNote);
    timelineNote.addEventListener("click", () => {
        instrument.samples[note]?.cloneNode().play();
    });

    // Create the timeline grid section on the right side
    const timelineGridRow = document.createElement("div");
    timelineGridRow.className = "timeline-row-grid";
    timelineRow.appendChild(timelineGridRow);

    for (let bar = 0; bar < bars; bar++) {
        for (let beat = 0; beat < beatsInABar; beat++) {
            // Make a single cell representing a beat in a bar in a row
            const timelineCell = document.createElement("div");
            timelineCell.className = "timeline-cell";
            timelineGridRow.appendChild(timelineCell);
            timelineCell.addEventListener("mousedown", () => {
                if (dragIsAdding === undefined) {
                    timelineCell.classList.toggle("active");
                    dragIsAdding = timelineCell.classList.contains("active");
                    if (dragIsAdding) {
                        instrument.samples[note]?.cloneNode().play();
                    }
                }
            });
            timelineCell.addEventListener("mouseenter", (ev) => {
                if (ev.buttons == 1) {
                    if (dragIsAdding === true) {
                        timelineCell.classList.add("active");
                        instrument.samples[note]?.cloneNode().play();
                    } else if (dragIsAdding === false) {
                        timelineCell.classList.remove("active");
                    }
                }
            });
        }
    }
}

document.addEventListener("mouseup", () => {
    dragIsAdding = undefined;
});

let stopPlaying = undefined;
function sleep(time) {
    return new Promise((resolve, reject) => {
        const currentPlayTimeout = setTimeout(resolve, time);
        stopPlaying = () => {
            clearTimeout(currentPlayTimeout);
            reject();
        };
    });
}

const playButton = document.querySelector("#play-btn");
playButton.addEventListener("click", async () => {
    if (stopPlaying !== undefined) {
        stopPlaying();
    }
    try {
        playButton.classList.add("active");
        await sleep((60 * 1000) / bpm);
        while (true) {
            clearPlayhead();
            for (let beat = 0; beat < beatsInABar * bars; beat++) {
                for (let note = 0; note < noteCount; note++) {
                    const timelineRow = pianoRollTimeline.children[note];
                    const timelineGridRow = timelineRow.children[1];
                    const timelineCell = timelineGridRow.children[beat];
                    timelineCell.classList.add("play-head");
                    if (timelineCell.classList.contains("active")) {
                        instrument.samples[note]?.cloneNode().play();
                    }
                }
                
                // Animate shapes on each beat
                animateShapes();
                
                await sleep((60 * 1000) / bpm);
            }
            if (!loopButton.classList.contains("active")) {
                break;
            }
        }
    } finally {
        playButton.classList.remove("active");
        clearPlayhead();
    }
});

function animateShapes() {
    const shapes = document.querySelectorAll('.shape');
    
    // Count active notes in the current beat
    let activeNotesCount = 0;
    for (let note = 0; note < noteCount; note++) {
        const timelineRow = pianoRollTimeline.children[note];
        const timelineGridRow = timelineRow.children[1];
        // Find current beat by looking for play-head class
        for (let beat = 0; beat < beatsInABar * bars; beat++) {
            const timelineCell = timelineGridRow.children[beat];
            if (timelineCell.classList.contains("play-head") && timelineCell.classList.contains("active")) {
                activeNotesCount++;
            }
        }
    }
    
    // Generate color based on active notes
    const shapeColor = getColorFromActiveNotes(activeNotesCount);
    
    shapes.forEach(shape => {
        // Random movement
        const currentTransform = shape.style.transform || '';
        const randomX = (Math.random() - 0.5) * 30; // -15 to 15 pixels
        const randomY = (Math.random() - 0.5) * 30;
        
        // Get existing rotation if it's the square
        let rotationMatch = currentTransform.match(/rotate\(([^)]+)\)/);
        let rotation = '';
        if (rotationMatch) {
            rotation = ` ${rotationMatch[0]}`;
        }
        
        shape.style.transform = `translate(${randomX}px, ${randomY}px)${rotation}`;
        
        // Apply color based on active notes
        applyShapeColor(shape, shapeColor);
        
        // Pulse effect
        shape.classList.remove('pulse');
        void shape.offsetWidth; // Trigger reflow
        shape.classList.add('pulse');
    });
}

function getColorFromActiveNotes(count) {
    // Different colors based on how many notes are playing
    const colors = [
        '#2ff083',  // 0 notes - green (default)
        '#00d4ff',  // 1 note - cyan
        '#ff00ff',  // 2 notes - magenta
        '#ffff00',  // 3 notes - yellow
        '#ff6b00',  // 4 notes - orange
        '#ff0066',  // 5+ notes - hot pink
    ];
    
    if (count >= colors.length) {
        return colors[colors.length - 1];
    }
    return colors[count];
}

function applyShapeColor(shape, color) {
    if (shape.classList.contains('circle1')) {
        shape.style.borderColor = color;
    } else if (shape.classList.contains('circle2')) {
        shape.style.background = `radial-gradient(circle, ${color}, transparent)`;
    } else if (shape.classList.contains('line1') || shape.classList.contains('line2')) {
        shape.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
    } else if (shape.classList.contains('square1')) {
        shape.style.borderColor = color;
    } else if (shape.classList.contains('triangle1')) {
        shape.style.borderBottomColor = color;
    }
}

function clearPlayhead() {
    for (let beat = 0; beat < beatsInABar * bars; beat++) {
        for (let note = 0; note < noteCount; note++) {
            const timelineRow = pianoRollTimeline.children[note];
            const timelineGridRow = timelineRow.children[1];
            const timelineCell = timelineGridRow.children[beat];
            timelineCell.classList.remove("play-head");
        }
    }
}

const pauseButton = document.querySelector("#pause-btn");
pauseButton.addEventListener("click", () => {
    if (stopPlaying !== undefined) {
        stopPlaying();
    }
});

const resetGridButton = document.querySelector("#resetGrid-btn");
resetGridButton.addEventListener("click", () => {
    for (let beat = 0; beat < beatsInABar * bars; beat++) {
        for (let note = 0; note < instrument.noteLabels.length; note++) {
            const timelineRow = pianoRollTimeline.children[note];
            const timelineGridRow = timelineRow.children[1];
            const timelineCell = timelineGridRow.children[beat];
            if (timelineCell.classList.contains("active")) {
                timelineCell.classList.remove("active");
            }
        }
    }
    if (stopPlaying !== undefined) {
        stopPlaying();
    }
});

const loopButton = document.querySelector("#loop-btn");
loopButton.addEventListener("click", () => {
    loopButton.classList.toggle("active");
});