// HTML elements //

const video = document.getElementById('preview');
const startButton = document.getElementById('start-camera'); 
const snapshot = document.getElementById('snapshot');
const viewfinder = document.getElementById('viewfinder');
const canvas = document.getElementById('captureCanvas');
const captureButton = document.getElementById('capture-btn');
const retakeButton = document.getElementById('retake-btn');

let currentFilter="none";


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

captureButton.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if(currentFilter !=="none") {
    snapshot.classList.add(`filter-${currentFilter}`);
  }

  canvas.style.display = "block";

  snapshot.src = canvas.toDataURL('image/png');
  snapshot.hidden = false;
  video.hidden = true;

  captureButton.hidden = true;
  retakeButton.hidden = false;

  viewfinder.classList.add('flash');
  setTimeout(() => viewfinder.classList.remove('flash'), 400);
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

