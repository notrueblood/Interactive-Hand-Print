import Controller from './handCanvas';

let handController;
let handCanvas;

const standardHandSettings = {
  rColor: {
    r: 255,
    g: 15,
    b: 15,
    a: 0.75,
  },

  sColor: {
    r: 3,
    g: 132,
    b: 176,
  },

  numberOfNeuronsToPreheat: 3,

  randomSuperchargedTimeSpread: 6000,

  nodeSettings: {
    minRadius: 2,
    maxRadius: 10,
  },

  dendriteSettings: {
    reachDistance: 20,
    density: 0.5,
  },

  electronStandardSettings: {
    minRadius: 2,
    maxRadius: 8,
    lifeSpan: 400,
    timeSpread: 5000,
    colorFadeTime: 70,
    redFadeInTime: 20,
    colorRadius: 30,
  },

  electronSuperChargedSettings: {
    lifeSpan: 200,
    radius: 4,
  },
};

function initHand(img) {
  handCanvas = document.getElementById('handCanvas');

  handCanvas.width = window.innerWidth;
  handCanvas.height = window.innerHeight;

  // context to draw to
  const context = handCanvas.getContext('2d');
  // context.globalCompositeOperation = 'xor';

  handController = new Controller(context, handCanvas, img);
  handController.begin(standardHandSettings);
}

function animate() {
  requestAnimationFrame(animate);
  const userScrollY = window.scrollY;
  if (userScrollY < handCanvas.height) {
    handController.animate(standardHandSettings);
  }
}

function loadImage(url) {
  const imageEl = document.createElement('img');
  imageEl.src = url;

  return new Promise((fulfill) => {
    imageEl.onload = () => fulfill(imageEl);
  });
}

(async function launchSite() {
  const img = await loadImage('client/images/hand.jpg');
  initHand(img);
  handController.animate(standardHandSettings);
  requestAnimationFrame(animate);
  // notesCanvas();
}());
