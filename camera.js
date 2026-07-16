// HTML elements //

const video = document.getElementById('preview');
const startButton = document.getElementById('start-camera'); 
const snapshot = document.getElementById('snapshot');
const viewfinder = document.getElementById('viewfinder');
const canvas = document.getElementById('captureCanvas');
const captureButton = document.getElementById('capture-btn');
const retakeButton = document.getElementById('retake-btn');
const gallery = document.getElementById('gallery');

let currentFilter="none";
let stripMode = false;

const FILTER_CSS = {
  bw: 'grayscale(100%) contrast(1.2)',
  camcorder: 'contrast(1.4) saturate(1.3) brightness(0.9)',
  digicam: 'contrast(1.3) saturate(1.5) brightness(1.1)',
  polaroid: 'sepia(0.2) contrast(1.1) brightness(1.05) saturate(1.2)',
};

// Turn on Camera //

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();

    viewfinder.classList.add('camera-on');
    startButton.style.display = 'none';

  } catch (error) {
    console.error('Could not access the camera:', error);

  if( error.name === 'NotAllowedError') {
    alert('Camera access was blocked. Please allow camera permissions to take photos');
  } else if (error.name === 'NotFoundError') {
    alert('No camera was found on this device. ');
  } else {
    alert('Something went wrong trying to access the camera');
  }
  }
});

// Capture a Frame from video onto canvas //

captureButton.addEventListener('click', async () => {
  if (!stripMode) {
    takeSinglePhoto();
    return;
  }

  const photos = [];

  for (let i = 0; i < 4; i++) {

    viewfinder.classList.add('flash');
    await new Promise(r => setTimeout(r, 300));
    viewfinder.classList.remove('flash');

    const imgData = await captureFrame();
    photos.push(imgData);

    await new Promise(r => setTimeout(r, 4000));
  }

  buildPhotoStrip(photos);

  captureButton.hidden = true;
  retakeButton.hidden = false;
});

// Helper Function //

function applyCurrentFilter(ctx) {
  ctx.filter = currentFilter !== "none" ? FILTER_CSS[currentFilter] : "none";
}

async function captureFrame() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}

function takeSinglePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  applyCurrentFilter(ctx);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgData = canvas.toDataURL('image/png');

  snapshot.src = imgData;
  snapshot.hidden = false;
  video.hidden = true;

  captureButton.hidden = true;
  retakeButton.hidden = false;

  addPhotoToGallery(imgData);
}

// Gallery //

const wrapper = document.createElement('div');

document.getElementById('open-gallery').addEventListener('click', () =>{
  const gallery = document.getElementById('gallery');
  gallery.scrollIntoView({behavior: 'smooth'});
});

function addPhotoToGallery(imgSrc) {
  const wrapper = document.createElement('div');
  wrapper.className = "polaroid";

  const img = document.createElement('img');
  img.src = imgSrc;
  wrapper.appendChild(img);

  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = "Download";
  downloadBtn.className = "ticket-btn";
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = "photobooth.png";
    link.click();
  });

const shareBtn = document.createElement('button');
shareBtn.textContent = "Share";
shareBtn.className = "ticket-btn";
shareBtn.addEventListener('click', async () => {
  try {
    const blob = await (await fetch(imgSrc)).blob();
    const file = new Filer([blob], "photobooth.png", { type: blob.type});

    await navigator.share({
      files: [file],
      title: "My Photobooth Picture",
      text: "Check out my photo!"
    });
  } catch {
    alert("Sharing not supported on this device.");
  }
});

  wrapper.appendChild(downloadBtn);
  wrapper.appendChild(shareBtn);

  gallery.appendChild(wrapper);
}

function buildPhotoStrip(photos) {
  const strip = document.createElement('div');
  strip.className = "photostrip-4";

  photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    strip.appendChild(img);
  });

  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = "Download Strip";
  downloadBtn.className = "ticket-btn";
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = strip.firstChild.src;
    link.download = "photostrip.png";
    link.click();
  });
 
  const shareBtn = document.createElement('button');
  shareBtn.textContent = "Share Strip";
  shareBtn.className = "ticket-btn";
  shareBtn.addEventListener('click', async () => {
    try {
      const blob = await (await fetch(strip.firstChild.src)).blob();
      const file = new File([blob], "photostrip.png", { type: blob.type });
 
      await navigator.share({
        files: [file],
        title: "My Photo Strip",
        text: "Check out my photobooth strip!"
      });
    } catch {
      alert("Sharing not supported on this device.");
    }
  });
 
  strip.appendChild(downloadBtn);
  strip.appendChild(shareBtn);
 
  gallery.appendChild(strip);
}


// Photo Strip//

document.getElementById('strip-mode').addEventListener('click', () => {
  stripMode = !stripMode;
});


// Go back to live feed - RETAKE //

retakeButton.addEventListener('click', () => {
  snapshot.hidden = true;
  video.hidden = false;

  canvas.style.display = "none";

  retakeButton.hidden = true;
  captureButton.hidden = false;

});

// Choose Filter //

document.querySelectorAll('.filters .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;

    video.className = "";
    snapshot.className = "";

    if(currentFilter !== "none") {
      video.classList.add(`filter-${currentFilter}`);
      snapshot.classList.add(`filter-${currentFilter}`);
    }

    document.querySelector('.camcorder-overlay').hidden = currentFilter !== "camcorder";
  });
});

