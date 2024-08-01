const mic_btn = document.querySelector('#mic');
const mic_Icon = document.querySelector('#mIcon');
const playback = document.querySelector('.playback');
mic_Icon.innerHTML ="mic"

mic_btn.addEventListener('click', ToggleMic);

let can_record = false;
let is_recording = false;
let recorder = null;
let chunks = [];


function SetupAudio(){
    console.log("setup audioo");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices
        .getUserMedia({
            audio: true
        })
        .then(SetupStream)
        .catch(err => {
            console.log(err)
        });
}}
SetupAudio();

function SetupStream(stream){
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    }
    recorder.onstop= async e=> {
        const blob = new Blob(chunks, { type:'audio/wav'});
        console.log("audio dataa",blob);
        
        submitAudioFiles(blob)
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        playback.src = audioURL;    
    }
    can_record = true;
}

function ToggleMic(){
    console.log("is_recording",is_recording)
    console.log("can_record",can_record)
    if (!can_record) return;

    is_recording = !is_recording;

    if(is_recording){
        recorder.start();
        mic_btn.classList.add("is-recording");
        mic_Icon.innerHTML = "pause"
    }else {
        recorder.stop();
        mic_btn.classList.remove("is-recording");
        mic_Icon.innerHTML ="mic"
}
}

async function submitAudioFiles(blob) {
    voice_api = "https://github.com/MohsinRaz3/Books/raw/master/mohsin.mp3"
    url = `http://localhost:8000/transcribe?blob=${encodeURIComponent(blob)}`
     

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                'Access-Control-Allow-Origin':'*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("fineall response ", responseData);
            return responseData

        } catch (error) {
            console.error('Error:', error);
        }
    }
