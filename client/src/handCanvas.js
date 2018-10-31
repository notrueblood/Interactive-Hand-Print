// Removes an element from the document
function removeElementFromDOM(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

function getPixelBrightness(imageData, x, y) {
  const i = ((y * imageData.width) + x) * 4;

  const r = imageData.data[i];
  const g = imageData.data[i + 1];
  const b = imageData.data[i + 2];

  const brightness = (r + g + b) / 3;
  return brightness;
}

function reachableViaDendrite(x1, y1, x2, y2, reachDist) {
  const xDist = Math.abs(x2 - x1);
  const yDist = Math.abs(y2 - y1);
  const distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
  if ((distance > reachDist) ||
    ((xDist === 0) && (yDist === 0))) {
    return false;
  }
  return true;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Electron {
  constructor(settings, nodeArray, type, x, y, canvas, offscreenCanvas) {
    this.id = Math.random() * Math.random() * 100000000;

    this.type = type;
    if (this.type === 'electron-standard') {
      const { lifeSpan, minRadius, maxRadius } = settings.electronStandardSettings;

      this.currentNode = nodeArray[Math.floor(Math.random() * nodeArray.length)];
      this.nextNode = this.currentNode.dendritesReachTowards[Math.floor(Math.random() *
        this.currentNode.dendritesReachTowards.length)];
      this.x = this.currentNode.x;
      this.y = this.currentNode.y;
      this.radius = Math.floor(Math.random() * maxRadius) + minRadius;
      this.lifeSpan = lifeSpan;
    } else {
      const { lifeSpan, radius } = settings.electronSuperChargedSettings;

      this.x = x;
      this.y = y;

      this.findNearestNode(nodeArray, canvas, offscreenCanvas);

      this.lifeSpan = lifeSpan;
      this.radius = (Math.random() * radius) + radius;
      // for drawing the lightning bolt
      this.movement = []; // array of positions the electron has been
    }
    this.isExploding = false;
  }

  standardMovement() {
    if ((typeof this.nextNode) !== 'undefined') {
      if (this.nextNode.x > this.x) {
        this.x += 1;
      }
      if (this.nextNode.x < this.x) {
        this.x -= 1;
      }
      if (this.nextNode.y > this.y) {
        this.y += 1;
      }
      if (this.nextNode.y < this.y) {
        this.y -= 1;
      }
      if ((this.x === this.nextNode.x) && (this.y === this.nextNode.y)) {
        this.currentNode = this.nextNode;
        // need to randomly pick from the potential next nodes
        this.nextNode = this.currentNode.dendritesReachTowards[Math.floor(Math.random() *
          this.currentNode.dendritesReachTowards.length)];
      }
    }
  }

  superchargedOnHandMovement(targetCanvas, offscreenCanvas) {
    if ((typeof this.nextNode) !== 'undefined') {
      const apsectRatio = offscreenCanvas.width / offscreenCanvas.height;

      const { height } = targetCanvas;
      const width = height * apsectRatio;

      const widthAdjustFactor = width / offscreenCanvas.width;
      const heightAdjustFactor = height / offscreenCanvas.height;

      const xOffset = (targetCanvas.width / 2) - (width / 2);
      const yOffset = (targetCanvas.height / 2) - (height / 2);

      const targetX = (Math.floor(this.nextNode.x * widthAdjustFactor) + xOffset);
      const targetY = (Math.floor(this.nextNode.y * heightAdjustFactor) + yOffset);

      if ((typeof this.nextNode) !== 'undefined') {
        if (targetX > this.x) {
          this.x += 1;
        }
        if (targetX < this.x) {
          this.x -= 1;
        }
        if (targetY > this.y) {
          this.y += 1;
        }
        if (targetY < this.y) {
          this.y -= 1;
        }
        if ((this.x === targetX) && (this.y === targetY)) {
          this.currentNode = this.nextNode;
          // need to randomly pick from the potential next nodes
          this.nextNode = this.currentNode.dendritesReachTowards[Math.floor(Math.random() *
            this.currentNode.dendritesReachTowards.length)];
        }
      }
    }
  }

  findNearestNode(nodeArray, canvas, offscreenCanvas) {
    const apsectRatio = offscreenCanvas.width / offscreenCanvas.height;

    const { height } = canvas;
    const width = height * apsectRatio;

    const widthAdjustFactor = offscreenCanvas.width / width;
    const heightAdjustFactor = offscreenCanvas.height / height;

    const xOffset = (canvas.width / 2) - (width / 2);
    const yOffset = (canvas.height / 2) - (height / 2);

    const adjustedX = (Math.floor(this.x - xOffset)) * widthAdjustFactor;
    const adjustedY = (Math.floor(this.y - yOffset)) * heightAdjustFactor;

    this.nearestDist = 999999;

    nodeArray.forEach((node) => {
      const xDist = Math.abs(node.x - adjustedX);
      const yDist = Math.abs(node.y - adjustedY);

      if (Math.sqrt((xDist * xDist) + (yDist * yDist)) < this.nearestDist) {
        this.nearestDist = Math.sqrt((xDist * xDist) + (yDist * yDist));
        this.nearestNode = node;
      }
    });
  }

  headTowardsNearestNode(targetCanvas, offscreenCanvas) {
    // need to go from rendered canvas space to offscreen canvas space
    const apsectRatio = offscreenCanvas.width / offscreenCanvas.height;

    const { height } = targetCanvas;
    const width = height * apsectRatio;

    const widthAdjustFactor = width / offscreenCanvas.width;
    const heightAdjustFactor = height / offscreenCanvas.height;

    const xOffset = (targetCanvas.width / 2) - (width / 2);
    const yOffset = (targetCanvas.height / 2) - (height / 2);

    const targetX = (Math.floor(this.nearestNode.x * widthAdjustFactor) + xOffset);
    const targetY = (Math.floor(this.nearestNode.y * heightAdjustFactor) + yOffset);

    if (targetX > this.x) {
      this.x += 7;
    } else if (targetX < this.x) {
      this.x -= 7;
    }
    if (targetY > this.y) {
      this.y += 7;
    } else if (targetY < this.y) {
      this.y -= 7;
    }

    const closeEnoughX = Math.abs(targetX - this.x) < 7;
    const closeEnoughY = Math.abs(targetY - this.y) < 7;

    if (closeEnoughX && closeEnoughY) {
      this.isExploding = true;
      this.x = targetX;
      this.y = targetY;
      this.currentNode = this.nearestNode;
      this.nextNode = this.currentNode.dendritesReachTowards[Math.floor(Math.random() *
        this.currentNode.dendritesReachTowards.length)];
    } else {
      // record positions for the bolt path
      this.movement.push(this.x);
      this.movement.push(this.y);
    }
  }

  update(targetCanvas, offscreenCanvas) {
    this.lifeSpan -= 1;
    if (this.lifeSpan < 1) {
      return 'dead';
    }

    if (this.type === 'electron-supercharged') {
      // Head towards the nearest node
      if (this.isExploding === false) {
        this.headTowardsNearestNode(targetCanvas, offscreenCanvas);
      } else {
        this.currentNode.expand();
        this.superchargedOnHandMovement(targetCanvas, offscreenCanvas);
      }
    } else {
      this.standardMovement();
    }

    return 'alive';
  }

  draw(context) {
    const ctx = context;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0.0, Math.PI * 2, false);

    // Color Logic
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

    ctx.fill();
    ctx.stroke();
  }

  drawSuperchargedTrial(context, rColor) {
    if (this.isExploding === false) {
      const ctx = context;
      if (this.movement.length > 2) {
        for (let m = 0; m < this.movement.length; m += 2) {
          ctx.beginPath();
          ctx.moveTo(this.movement[m], this.movement[m + 1]);
          ctx.lineTo(this.movement[m + 2], this.movement[m + 3]);
          ctx.lineWidth = 4;
          this.lineA = m / this.nearestDist;
          ctx.strokeStyle = `rgba(${rColor.r}, ${rColor.g}, ${rColor.b}, ${this.lineA})`;
          ctx.stroke();
        }
      }
    }
  }
}

class Dendrite {
  constructor(settings, x0, y0, x1, y1) {
    this.type = 'dendrite';

    const { rColor, sColor } = settings;
    this.rColor = rColor;
    this.sColor = sColor;
    this.x0 = x0;
    this.x1 = x1;
    this.y0 = y0;
    this.y1 = y1;
  }

  draw(context) {
    const ctx = context;

    ctx.beginPath();
    ctx.moveTo(this.x0, this.y0);
    ctx.lineWidth = 1;
    ctx.lineTo(this.x1, this.y1);

    if (this.colorFade > 0) {
      ctx.strokeStyle = `rgba(${this.rColor.r}, ${this.rColor.g}, ${this.rColor.b}, 0.2)`;
    } else {
      ctx.strokeStyle = `rgba(${this.sColor.r}, ${this.sColor.g}, ${this.sColor.b}, 0.2)`;
    }

    ctx.stroke();
  }
}

class Node {
  constructor(x, y, radius) {
    this.type = 'node';
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.normalRadius = radius;
    this.shrinking = 0;
    this.expanding = 0;
    this.electronResponsibleForExpanding = null;
    this.colorFade = 0;
    this.colorA = 1;

    this.dendritesReachTowards = [];
  }

  expand() {
    this.expanding = 5;
  }

  update(nodeArray, electronArray) {
    if (this.expanding > 0) {
      if (this.radius < this.normalRadius * 3) {
        this.radius += this.expanding / 5;
        this.expanding -= 1;
      } else {
        this.radius -= this.expanding / this.radius;
        this.expanding -= 1;
      }
      this.colorFade = 50;
    } else {
      if ((this.shrinking > 0) && (this.radius > 1)) {
        this.radius -= (1 / this.shrinking) * 0.5;
        this.shrinking -= 1;
      } else if (this.radius < this.normalRadius) {
        this.radius += 1;
      }

      if (this.radius > this.normalRadius) {
        this.radius = this.normalRadius;
      }

      if (this.radius < 1) {
        this.radius = 1;
      }
    }

    // Handle color fade
    if (this.colorFade > 0) {
      this.colorFade -= 1;
    }

    // Need to expand when electrons are near
    electronArray.forEach((electron) => {
      if (electron.type === 'electron-standard') {
        const distX = Math.abs(electron.x - this.x);
        const distY = Math.abs(electron.y - this.y);

        const dist = Math.sqrt((distX * distX) + (distY * distY));

        if (dist < 120) {
          // close enough to shrink
          this.shrinking = dist;
        }
      }
      /*
      else if (electron.type === 'electron-supercharged') {
        if (electron.isExploding === true) {
          const distX = Math.abs(electron.nearestNode.x - this.x);
          const distY = Math.abs(electron.nearestNode.y - this.y);

          const dist = Math.sqrt((distX * distX) + (distY * distY));
          if (dist < 40) {
            // close enough to shrink
            this.expanding = dist;
            this.colorFade = 70;
            // this.electronResponsibleForExpanding = electron.id;
          }
        }
      }
      */
    });
  }

  draw(context, settings) {
    const ctx = context;
    const { rColor } = settings;
    const { sColor } = settings;
    const { colorFadeTime } = settings.electronStandardSettings;
    const { redFadeInTime } = settings.electronStandardSettings;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0.0, Math.PI * 2, false);

    // Color Logic
    if (this.colorFade > (colorFadeTime / 2)) {
      ctx.strokeStyle = `rgba(${rColor.r}, ${rColor.g}, ${rColor.b}, 1)`;
      ctx.fillStyle = `rgba(${rColor.r}, ${rColor.g}, ${rColor.b}, 1)`;
    } else if (this.colorFade > 0) {
      this.colorA = 1 / ((colorFadeTime / 2) / this.colorFade);
      ctx.strokeStyle = `rgba(${rColor.r}, ${rColor.g}, ${rColor.b}, ${this.colorA})`;
      ctx.fillStyle = `rgba(${rColor.r}, ${rColor.g}, ${rColor.b}, ${this.colorA})`;
      this.redFadeIn = 0;
    } else if (this.redFadeIn < redFadeInTime) {
      this.colorA = this.redFadeIn / redFadeInTime;
      ctx.strokeStyle = `rgba(255, 0, 0, ${this.colorA})`;
      ctx.fillStyle = `rgba(255, 0, 0, ${this.colorA})`;
      this.redFadeIn += 1;
    } else {
      ctx.strokeStyle = `rgba(${sColor.r}, ${sColor.g}, ${sColor.b}, 1)`;
      ctx.fillStyle = `rgba(${sColor.r}, ${sColor.g}, ${sColor.b}, 1)`;
    }
    ctx.fill();
    ctx.stroke();
  }
}

class Controller {
  constructor(context, canvas, img) {
    this.nodeArray = [];
    this.electronArray = [];

    this.ctx = context;
    this.canvas = canvas;
    this.imageLoaded = false;
    this.handImage = img;
  }

  // For responsiveness
  beginResizeCanvasToWindow() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      if (window.innerWidth !== this.canvas.width) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });
  }

  extractDataFromHandImage() {
    if (this.imageLoaded === false) {
      // Draw it to the offscreen canvas
      this.offScreenHandCanvas = document.createElement('canvas');
      this.offScreenHandCanvas.width = this.handImage.width * 1.4;
      this.offScreenHandCanvas.height = this.handImage.height * 1.4;
      this.offScreenHandCanvasContext = this.offScreenHandCanvas.getContext('2d');

      this.offScreenHandCanvasContext.drawImage(this.handImage, 0, 0);

      // Extract pixel data from the offscreen canvas
      this.hand = this.offScreenHandCanvasContext.getImageData(
        0, 0, // sx, sy
        this.offScreenHandCanvas.width, this.offScreenHandCanvas.height, // sw, sh
      );

      for (let i = 0; i < this.hand.data.length; i += 4) {
        this.hand.data[i] = this.hand.data[i]; // R
        this.hand.data[i + 1] = this.hand.data[i + 1]; // G
        this.hand.data[i + 2] = this.hand.data[i + 2]; // B
        this.hand.data[i + 3] = 255; // A
      }

      this.imageLoaded = true;
    }
  }

  scaleAndRenderToOnScreenCanvas() {
    const apsectRatio = this.offScreenNodeCanvas.width / this.offScreenNodeCanvas.height;

    const { height } = this.canvas;
    const width = height * apsectRatio;

    const xOffset = (this.canvas.width / 2) - (width / 2);
    const yOffset = (this.canvas.height / 2) - (height / 2);

    this.ctx.drawImage(this.offScreenNodeCanvas, xOffset, yOffset, width, height);
  }

  createHandOutOfNodes(settings) {
    this.nodeArray = [];

    let padScale = 8;

    if (window.innerWidth < 800) {
      padScale = 4;
    }

    if (window.innerWidth < 500) {
      padScale = 2;
    }

    const paddingW = this.handImage.width / padScale;
    const paddingH = this.handImage.height / padScale;

    const totalPaddingW = paddingW * 2;
    const totalPaddingH = paddingH * 2;

    this.offScreenNodeCanvas = document.createElement('canvas');
    this.offScreenNodeCanvas.width = this.handImage.width + totalPaddingW;
    this.offScreenNodeCanvas.height = this.handImage.height + totalPaddingH;
    this.offScreenNodeCanvasContext = this.offScreenNodeCanvas.getContext('2d');

    // Handle the node positioning
    for (let w = 16; w < this.handImage.width - 16; w += 8) {
      for (let h = 16; h < this.handImage.height - 16; h += 8) {
        if (((getPixelBrightness(this.hand, w, h)) < 100) &&
        Math.random() > 0.4) {
          // place a node
          const x = w + paddingW;
          const y = h + paddingH;

          const { minRadius, maxRadius } = settings.nodeSettings;
          const radius = Math.floor(Math.random() * maxRadius) + minRadius;

          this.nodeArray.push(new Node(x, y, radius));
        }
      }
    }
  }

  makeAnElectron(settings, type, x = 0, y = 0) {
    this.electronArray.push(new Electron(
      settings,
      this.nodeArray,
      type,
      x,
      y,
      this.canvas,
      this.offScreenNodeCanvas,
    ));
  }

  makeADendrite(settings, x0, y0, x1, y1) {
    this.dendriteArray.push(new Dendrite(settings, x0, y0, x1, y1));
  }

  makeDendrites(settings) {
    this.dendriteArray = [];

    const { reachDistance, density } = settings.dendriteSettings;

    this.nodeArray.forEach((node0) => {
      this.nodeArray.forEach((node1) => {
        if ((reachableViaDendrite(node0.x, node0.y, node1.x, node1.y, reachDistance)) &&
          (Math.random() > (1 - density))) {
          this.makeADendrite(settings, node0.x, node0.y, node1.x, node1.y);
          node0.dendritesReachTowards.push(node1);
        }
      });
    });
  }

  // For interactivity
  beginElectronSpawnOnClick(settings) {
    window.addEventListener('click', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY + window.scrollY;

      if (this.canvas.height > mouseY) {
        this.makeAnElectron(settings, 'electron-supercharged', mouseX, mouseY);
      }
    }, false);
  }

  writeMyNameOnScreen() {
    let textSize = this.canvas.width / 30;

    if (window.innerWidth < 600) {
      textSize = this.canvas.width / 15;
    }

    this.ctx.font = `${textSize}px IBM Plex Sans`;
    this.ctx.fillStyle = '#111114';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Noah Trueblood', this.canvas.width / 20, this.canvas.height / 8);
  }

  // For spreading out how often the electrons are spawning
  electronSpawnRepeat(settings) {
    setInterval(
      () => this.makeAnElectron(
        settings,
        'electron-standard',
      ),
      settings.electronStandardSettings.timeSpread,
    );
  }

  superchargedElectronSpawnRepeat(settings) {
    setInterval(
      () => this.makeAnElectron(
        settings,
        'electron-supercharged',
        getRandomInt(this.canvas.width),
        getRandomInt(this.canvas.height)
      ),
      settings.randomSuperchargedTimeSpread,
    );
  }

  removeElectron(electron) {
    const index = this.electronArray.indexOf(electron);

    const doesExist = index > -1;
    if (doesExist) {
      this.electronArray.splice(index, 1);
    }
  }

  updateElectrons() {
    this.electronArray().forEach((electron) => {
      const status = electron.update(this.electronArray, this.nodeArray);
      if (status === 'dead') {
        this.removeRogueelectron();
      }
    });
  }

  whatToAnimate() {
    return [...this.dendriteArray, ...this.nodeArray, ...this.electronArray];
  }

  animate(settings) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.offScreenNodeCanvasContext.clearRect(
      0, 0,
      this.offScreenNodeCanvas.width, this.offScreenNodeCanvas.height,
    );

    const objectsToAnimate = this.whatToAnimate();

    objectsToAnimate.forEach((object) => {
      switch (object.type) {
        case 'dendrite': {
          object.draw(this.offScreenNodeCanvasContext);
          break;
        }
        case 'node': {
          object.update(this.nodeArray, this.electronArray);
          object.draw(this.offScreenNodeCanvasContext, settings, this.nodeArray);
          break;
        }
        case 'electron-standard': {
          const lifeStatus = object.update(this.canvas, this.offScreenNodeCanvas);
          if (lifeStatus === 'dead') {
            this.removeElectron(object);
          } else {
            // object.draw(this.offScreenNodeCanvasContext);
          }
          break;
        }
        case 'electron-supercharged': {
          const lifeStatus = object.update(this.canvas, this.offScreenNodeCanvas);
          if (lifeStatus === 'dead') {
            this.removeElectron(object);
          } else {
            // object.draw(this.ctx);
            object.drawSuperchargedTrial(this.ctx, settings.rColor);
          }
          break;
        }
        default:
          break;
      }
    });

    this.offScreenNodeCanvasContext.globalCompositeOperation = 'xor';

    this.scaleAndRenderToOnScreenCanvas();

    this.writeMyNameOnScreen();
  }

  async begin(settings) {
    this.extractDataFromHandImage();
    this.createHandOutOfNodes(settings);
    this.scaleAndRenderToOnScreenCanvas();
    this.makeDendrites(settings);

    this.beginResizeCanvasToWindow();

    this.offScreenNodeCanvasContext.globalCompositeOperation = 'xor';

    this.makeAnElectron(settings, 'electron-standard');
    this.makeAnElectron(settings, 'electron-standard');
    this.makeAnElectron(settings, 'electron-standard');

    // this.makeAelectron(settings);

    this.beginElectronSpawnOnClick(settings);

    // this.preheatNumberOfelectrons(settings);

    this.electronSpawnRepeat(settings);
    this.superchargedElectronSpawnRepeat(settings)
  }
}

export default Controller;
