// Settings
let bpm = 120;
const bars = 4;
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
    displayName: "Piano and Drumkit",
    noteLabels: piano.noteLabels.concat(drumkit.noteLabels),
    samples: piano.samples.concat(drumkit.samples),
};

const bpmInput = document.querySelector("#bpm-input");

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

let isPlaying = false;
let resetSleep = undefined;
let stopPlaying = undefined;
function sleep(time) {
    return new Promise((resolve, reject) => {
        const currentPlayTimeout = setTimeout(resolve, time);
        stopPlaying = () => {
            clearTimeout(currentPlayTimeout);
            reject();
        };
        resetSleep = () => {
            clearTimeout(currentPlayTimeout);
            resolve();
        };
    });
}

const playButton = document.querySelector("#play-btn");
playButton.addEventListener("click", () => {
    togglePlaying();
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && event.target.tagName !== "INPUT") {
        event.preventDefault();
        togglePlaying();
    }
});

bpmInput.addEventListener("change", () => {
    bpm = parseInt(bpmInput.value);
    if (resetSleep !== undefined) {
        resetSleep();
    }
});

function togglePlaying() {
    if (isPlaying && stopPlaying !== undefined) {
        stopPlaying();
        return;
    }
    beginPlaying();
}

async function beginPlaying() {
    try {
        isPlaying = true;
        playButton.classList.add("active");
        await sleep((60 * 1000) / bpm);
        while (true) {
            clearPlayhead();
            for (let beat = 0; beat < beatsInABar * bars; beat++) {
                for (let note = 0; note < noteCount; note++) {
                    const timelineRow = pianoRollTimeline.children[note];
                    const timelineGridRow = timelineRow.children[1];
                    const timelineCell = timelineGridRow.children[beat];
                    timelineCell.classList.add("play-head")
                    if (timelineCell.classList.contains("active")) {
                        instrument.samples[note]?.cloneNode().play();
                    }
                }
                await sleep((60 * 1000) / bpm);
            }
            if (!loopButton.classList.contains("active")) {
                break;
            }
        }
    } finally {
        isPlaying = false;
        playButton.classList.remove("active");
        clearPlayhead();
    }
}

function clearPlayhead() {
    for (let beat = 0; beat < beatsInABar * bars; beat++) {
        for (let note = 0; note < noteCount; note++) {
            const timelineRow = pianoRollTimeline.children[note];
            const timelineGridRow = timelineRow.children[1];
            const timelineCell = timelineGridRow.children[beat];
            timelineCell.classList.remove("play-head")
        }
    }
}



const resetGridButton = document.querySelector("#resetGrid-btn");
resetGridButton.addEventListener("click", () => {
    resetGrid();
});

function resetGrid() {
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
}

const loopButton = document.querySelector("#loop-btn");
loopButton.addEventListener("click", () => {
    loopButton.classList.toggle("active");
});

const saveButton = document.querySelector("#save-btn");
saveButton.addEventListener("click", () => {
    const grid = {notes: []};
    for (let beat = 0; beat < beatsInABar * bars; beat++) {
        for (let note = 0; note < instrument.noteLabels.length; note++) {
            const timelineRow = pianoRollTimeline.children[note];
            const timelineGridRow = timelineRow.children[1];
            const timelineCell = timelineGridRow.children[beat];
            if (timelineCell.classList.contains("active")) {
                grid.notes.push({ beat: beat, note: note });
            }
        }
    }
    const encodedGrid = "0" + btoa(JSON.stringify(grid));
    console.log(encodedGrid);
    navigator.clipboard.writeText(encodedGrid);
});

const loadButton = document.querySelector("#load-btn");
loadButton.addEventListener("click", () => {
    const encodedGrid = prompt("Paste sharing code");
    const version = encodedGrid[0];
    if (version !== 0) {
        throw new Error("unknown code version: " + version);
    }
    const grid = JSON.parse(atob(encodedGrid.slice(1)));
    resetGrid();
    for (const {beat, note} of grid.notes) {
        const timelineRow = pianoRollTimeline.children[note];
        const timelineGridRow = timelineRow.children[1];
        const timelineCell = timelineGridRow.children[beat];
        timelineCell.classList.add("active");
    }
});