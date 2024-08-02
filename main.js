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
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        await submitAudioFiles(blob);
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        playback.src = audioURL;
    };
    can_record = true;
}

function ToggleMic() {
    console.log("is_recording",is_recording)
    console.log("can_record",can_record)
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
    // const audioFile = new File([blob], filename, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file',blob, `${filename}`)
    console.log("formadata22 ",formData)

    const url = `http://localhost:8000/transcribe`;
   // console.log("this is encoeed url",url);

    // for (const [key, value] of formData.entries()) {
    //     console.log(`Key: ${key}`, `Value:`, value);    }
    // // Extract the Blob from FormData
    // const extractedBlob = formData.get('file');

    // // Verify the Blob was extracted correctly
    // console.log("extractedBlob",extractedBlob);

    // // Create an Object URL from the Blob and play it
    // const audioUrl = URL.createObjectURL(extractedBlob);
    // const audioElement = new Audio(audioUrl);

    // // Play the audio
    // audioElement.play();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body:formData
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
