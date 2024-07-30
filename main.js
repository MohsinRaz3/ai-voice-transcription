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
        saladTranscription(blob)
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

function saladTranscription(blob){
    
const organization_name = "mohsin-org-v2";
const url = `https://api.salad.com/api/public/organizations/${organization_name}/inference-endpoints/transcribe/jobs`;
const salad_key = "3ab1102d-e4a4-42d8-ab93-5b2b97d3a259";
const language_code = "en";

// Add your audio links here 
const list_of_audio_files = blob

// Placeholder for job_ids
const list_of_job_ids = [];

const headers = {
    "Salad-Api-Key": salad_key,
    "Content-Type": "application/json",
    "accept": "application/json"
};

// Function to submit audio files for transcription
async function submitAudioFiles() {
   
        const data = {
            input: {
                url:  list_of_audio_files,
                language_code: language_code,
                word_level_timestamps: true,
                diarization: true,
                srt: true
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const job_id = responseData.id;
            list_of_job_ids.push(job_id);

            // Save job_ids to a file if needed (uncomment the code below)
            const job_id_str = `"${job_id}",`;
            console.log("joooob id", job_id_str);
            // Open a file and write the job_id to it
             fs.appendFileSync('queue_test.txt', job_id_str + '\n');
        } catch (error) {
            console.error('Error:', error);
        }
    }


// // Execute the function
submitAudioFiles();

}