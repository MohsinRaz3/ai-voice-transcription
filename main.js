const mic_btn = document.querySelector('#mic');
const mic_Icon = document.querySelector('#mIcon');
const playback = document.querySelector('.playback');
const recordingStatus = document.querySelector('#recording-status');

mic_Icon.innerHTML = "mic";

mic_btn.addEventListener('click', ToggleMic);

let can_record = false;
let is_recording = false;
let recorder = null;
let chunks = [];

function SetupAudio() {
    console.log("setup audio");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({
                audio: true
            })
            .then(SetupStream)
            .catch(err => {
                console.error('Error accessing media devices:', err);
            });
    } else {
        console.error('Media devices not supported in this browser.');
    }
}
SetupAudio();

async function SetupStream(stream) {
    try {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e => {
            chunks.push(e.data);
        };
        recorder.onstop = async e => {
            try {
                const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                await submitAudioFiles(blob);
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                playback.src = audioURL;
            } catch (err) {
                console.error('Error during onstop event:', err);
            }
            // Clear the recording status when recording stops
            recordingStatus.innerHTML = "";
        };
        can_record = true;
    } catch (err) {
        console.error('Error setting up the stream:', err);
    }
}

function ToggleMic() {
    console.log("is_recording", is_recording);
    console.log("can_record", can_record);
    if (!can_record) {
        console.error('Cannot record: recorder is not ready.');
        return;
    }

    is_recording = !is_recording;

    try {
        if (is_recording) {
            recorder.start();
            mic_btn.classList.add("is-recording");
            mic_Icon.innerHTML = "pause";
            recordingStatus.innerHTML = "Recording...";
        } else {
            recorder.stop();
            mic_btn.classList.remove("is-recording");
            mic_Icon.innerHTML = "mic";
            recordingStatus.innerHTML = ""; // Clear the status when paused
        }
    } catch (err) {
        console.error('Error toggling microphone:', err);
    }
}

async function submitAudioFiles(blob) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audio_${timestamp}.wav`;
    const formData = new FormData();
    formData.append('file', blob, filename);
    console.log("formdata", formData);

    const url = "https://salad-api-v2.onrender.com/transcribe";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("final response", responseData);
        return responseData;

    } catch (error) {
        console.error('Error submitting audio files:', error);
    }
}
