const mic_btn = document.querySelector('#mic');
const mic_Icon = document.querySelector('#mIcon');
const playback = document.querySelector('.playback');
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
                console.log(err);
            });
}
}
SetupAudio();

async function SetupStream(stream) {
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    };
    recorder.onstop = async e => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        await submitAudioFiles(blob);
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        playback.src = audioURL;
    };
    can_record = true;
}

function ToggleMic() {
    if (!can_record) return;

    is_recording = !is_recording;

    if (is_recording) {
        recorder.start();
        mic_btn.classList.add("is-recording");
        mic_Icon.innerHTML = "pause";
    } else {
        recorder.stop();
        mic_btn.classList.remove("is-recording");
        mic_Icon.innerHTML = "mic";
    }
}


async function submitAudioFiles(blob) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audio_${timestamp}.wav`;
    const audioFile = new File([blob], filename, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file',audioFile, filename)


    const url = `http://localhost:8000/transcribe`;
    console.log("this is encoeed url",formData);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).then(response => {
            console.log('File uploaded successfully', response);
        }).catch(error => {
            console.error('Error uploading file:', error);
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("final response ", responseData);
        return responseData;

    } catch (error) {
        console.error('Error:', error);
    }
}
