const video = document.getElementById('preview');
const startButton = document.getElementById('start-camera'); 

startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: tru: });
    video.srcObject = stream;

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
