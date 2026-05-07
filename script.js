/* ELEMENTOS */

const videoPlayer =
    document.getElementById("videoPlayer");

const videoInput =
    document.getElementById("videoInput");

const subtitleInput =
    document.getElementById("subtitleInput");

const videoList =
    document.getElementById("videoList");

const seekBar =
    document.getElementById("seekBar");

const volumeBar =
    document.getElementById("volumeBar");

const fsSeekBar =
    document.getElementById("fsSeekBar");

const fsVolumeBar =
    document.getElementById("fsVolumeBar");

const container =
    document.getElementById("videoContainer");

const subtitleDiv =
    document.getElementById("subtitle");

const fullscreenUI =
    document.getElementById("fullscreenUI");

const menuToggleBtn =
    document.getElementById(
        "menuToggleBtn"
    );

/* DADOS */

let videos = [];

let subtitles = [];

let menuVisible = true;

/* =========================
   CARREGAR VIDEOS
========================= */

videoInput.onchange = (e)=>{

    [...e.target.files].forEach(file=>{

        videos.push({

            name:file.name,

            url:URL.createObjectURL(file)

        });

    });

    renderVideos();

    if(videos.length === e.target.files.length){

        loadVideo(0);
    }
};

function renderVideos(){

    videoList.innerHTML = "";

    videos.forEach((video,index)=>{

        const div =
            document.createElement("div");

        div.innerText = video.name;

        div.onclick = ()=>loadVideo(index);

        videoList.appendChild(div);

    });
}

function loadVideo(index){

    videoPlayer.src =
        videos[index].url;

    videoPlayer.play();
}

/* =========================
   CONTROLES
========================= */

function togglePlay(){

    videoPlayer.paused
        ? videoPlayer.play()
        : videoPlayer.pause();
}

function stopVideo(){

    videoPlayer.pause();

    videoPlayer.currentTime = 0;
}

function forward(){

    videoPlayer.currentTime = Math.min(

        videoPlayer.currentTime + 10,

        videoPlayer.duration || 0
    );
}

function backward(){

    videoPlayer.currentTime = Math.max(

        videoPlayer.currentTime - 10,

        0
    );
}

function muteVideo(){

    videoPlayer.muted =
        !videoPlayer.muted;
}

/* =========================
   SEEK BAR
========================= */

videoPlayer.addEventListener(
    "timeupdate",
    ()=>{

        if(videoPlayer.duration){

            const value =

                (
                    videoPlayer.currentTime /

                    videoPlayer.duration

                ) * 100;

            seekBar.value = value;

            fsSeekBar.value = value;
        }

        updateSubtitle();
    }
);

seekBar.oninput = ()=>{

    videoPlayer.currentTime =

        (
            seekBar.value / 100
        ) * videoPlayer.duration;
};

fsSeekBar.oninput = ()=>{

    videoPlayer.currentTime =

        (
            fsSeekBar.value / 100
        ) * videoPlayer.duration;
};

/* =========================
   VOLUME
========================= */

volumeBar.oninput = ()=>{

    videoPlayer.volume =
        volumeBar.value;

    fsVolumeBar.value =
        volumeBar.value;
};

fsVolumeBar.oninput = ()=>{

    videoPlayer.volume =
        fsVolumeBar.value;

    volumeBar.value =
        fsVolumeBar.value;
};

/* =========================
   FULLSCREEN
========================= */

function toggleFullscreen(){

    if(!document.fullscreenElement){

        container.requestFullscreen();

        menuVisible = true;

        fullscreenUI.classList.add(
            "active"
        );

        updateMenuButton();

    }else{

        document.exitFullscreen();

        fullscreenUI.classList.remove(
            "active"
        );
    }
}

/* =========================
   MENU FULLSCREEN
========================= */

function toggleFullscreenMenu(){

    menuVisible = !menuVisible;

    if(menuVisible){

        fullscreenUI.classList.add(
            "active"
        );

    }else{

        fullscreenUI.classList.remove(
            "active"
        );
    }

    updateMenuButton();
}

function updateMenuButton(){

    menuToggleBtn.innerText =

        menuVisible
            ? "🙈"
            : "👁";
}

/* =========================
   LEGENDA SRT
========================= */

subtitleInput.onchange = (e)=>{

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = (event)=>{

        subtitles =
            parseSRT(event.target.result);
    };

    reader.readAsText(file);
};

function parseSRT(data){

    const blocks =
        data.split(/\n\s*\n/);

    let result = [];

    blocks.forEach(block=>{

        const lines =
            block.split("\n");

        if(lines.length >= 3){

            const time =
                lines[1];

            const text =
                lines
                .slice(2)
                .join("<br>");

            const times =
                time.split(" --> ");

            result.push({

                start:
                    srtTimeToSeconds(
                        times[0]
                    ),

                end:
                    srtTimeToSeconds(
                        times[1]
                    ),

                text:text
            });
        }
    });

    return result;
}

function srtTimeToSeconds(time){

    const parts =

        time
        .replace(",",".")
        .split(":");

    return(

        parseFloat(parts[0]) * 3600 +

        parseFloat(parts[1]) * 60 +

        parseFloat(parts[2])
    );
}

function updateSubtitle(){

    const current =
        videoPlayer.currentTime;

    const subtitle =
        subtitles.find(sub=>

            current >= sub.start &&

            current <= sub.end
        );

    subtitleDiv.innerHTML =

        subtitle
            ? subtitle.text
            : "";
}

/* =========================
   TECLADO
========================= */

document.addEventListener(
    "keydown",
    (e)=>{

        switch(e.code){

            case "Space":

                e.preventDefault();

                togglePlay();

                break;

            case "ArrowRight":

                forward();

                break;

            case "ArrowLeft":

                backward();

                break;

            case "KeyM":

                muteVideo();

                break;

            case "KeyF":

                toggleFullscreen();

                break;

            case "KeyH":

                toggleFullscreenMenu();

                break;
        }
    }
);

/* =========================
   LIMPAR MEMORIA
========================= */

window.addEventListener(
    "beforeunload",
    ()=>{

        videos.forEach(video=>{

            URL.revokeObjectURL(
                video.url
            );

        });
    }
);

/* =========================
   INICIAR BOTÃO
========================= */

updateMenuButton();