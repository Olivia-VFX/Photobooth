// HTML elements //

const video = document.getElementById('preview');
const startButton = document.getElementById('start-camera'); 
const snapshot = document.getElementById('snapshot');
const viewfinder = document.getElementById('viewfinder');
const canvas = document.getElementById('captureCanvas');
const captureButton = document.getElementById('capture-btn');
const retakeButton = document.getElementById('retake-btn');

let currentFilter="none";
let stripMode = false;

// Turn on Camera //

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();

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

async function captureFrame() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  if (currentFilter !== "none") {
  snapshot.classList.add(`filter-${currentFilter}`);
}

  return canvas.toDataURL('image/png');
}

function takeSinglePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgData = canvas.toDataURL('image/png');

  snapshot.src = imgData;
  snapshot.hidden = false;
  video.hidden = true;

  addPhotoToGallery(imgData);
}

// Gallery //

const gallery = document.getElementById('gallery');

const wrapper = document.createElement('div');

document.getElementById('open-gallery').addEventListener('click', () =>{
  const gallery = document.getElementById('gallery');
  gallery.scrollIntoView({behavior: 'smooth'});
});

if (currentFilter === "polaroid") {
  wrapper.className = "polaroid";
} else {
  wrapper.className = "photostrip";
}

const img = document.createElement('img');
img.src = snapshot.src;

const downloadBtn = document.createElement('button');
downloadBtn.textContent = "Download";
downloadBtn.className = "btn";
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = snapshot.src;
  link.download = "photobooth.png";
  link.click();
});

const shareBtn = document.createElement('button');
shareBtn.textContent = "Share";
shareBtn.className = "btn";
shareBtn.addEventListener('click', async () => {
  try {
    const blob = await (await fetch(snapshot.src)).blob();
    const file = new File([blob], "photobooth.png", { type: blob.type });

    await navigator.share({
      files: [file],
      title: "My Photobooth Picture",
      text: "Check out my photo!"
    });
  } catch (err) {
    alert("Sharing not supported on this device.");
  }
});

wrapper.appendChild(img);
wrapper.appendChild(downloadBtn);
wrapper.appendChild(shareBtn);

gallery.appendChild(wrapper);

function buildPhotoStrip(photos) {
  const gallery = document.getElementById('gallery');

  const strip = document.createElement('div');
  strip.className = "photostrip-4";

  photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    strip.appendChild(img);
  });

  function addPhotoToGallery(imgSrc) {
  const gallery = document.getElementById('gallery');

  const wrapper = document.createElement('div');
  wrapper.className = "gallery-item";

  const img = document.createElement('img');
  img.src = imgSrc;

  wrapper.appendChild(img);
  gallery.appendChild(wrapper);
}

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = "Download Strip";
  downloadBtn.className = "btn";
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = strip.firstChild.src;
    link.download = "photostrip.png";
    link.click();
  });

  // Share button
  const shareBtn = document.createElement('button');
  shareBtn.textContent = "Share Strip";
  shareBtn.className = "btn";
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

    if (currentFilter === "camcorder") {
      document.querySelector('.camcorder-overlay').hidden = false;
    } else {
      document.querySelector('.camcorder-overlay').hidden = true;
    }
  });
});

