import {Colour} from 'canvas-sandbox'

class AnimationParameter {
    constructor(start, min, max, delta) {
        this.start = start;
        this.min = min;
        this.max = max;
        this.delta = delta;
        this.reset();
    }

    update() {
        if (this.current > this.max || this.current < this.min) {
            this.direction *= -1;
        }
        this.current += this.delta * this.direction;
    }

    reset() {
        this.current = this.start;
        this.direction = 1;
    }

    get() {
        return this.current;
    }

    static bounded(start, min, max, delta) {
        return new AnimationParameter(start, min, max, delta);
    }

    static unbounded(start, delta) {
        return new AnimationParameter(start, -Infinity, Infinity, delta);
    }

    static none() {
        return this.unbounded(1, 0);
    }
}

class PatternRenderer {
    constructor(canvasId, computePixel, animationParameter) {
        let canvas = document.getElementById(canvasId);
        this.ctx = canvas.getContext('2d');
        this.ctx.fillStyle = "#FFFFFF";
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = this.ctx.createImageData(this.width, this.height);
        this.computePixel = computePixel.bind(this);
        this.animationParameter = animationParameter || AnimationParameter.none();
        this.animation = {active: false, id: undefined}
    }

    draw() {
        this.clear();

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let colour = this.computePixel(x, y, this.animationParameter.get());
                this.setPixel(x, y, colour);
            }
        }

        this.ctx.putImageData(this.image, 0, 0);
    }

    animate() {
        if (!this.animation.active) {
            const drawInterval = 100;
            this.animation.id = setInterval(() => {
                this.animationParameter.update();
                this.draw();
            }, drawInterval);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    setPixel(x, y, colour) {
        let index = (x + y * this.image.width) * 4;
        this.image.data[index] = colour.r;
        this.image.data[index + 1] = colour.g;
        this.image.data[index + 2] = colour.b;
        this.image.data[index + 3] = colour.a;
    }
}

const {pow, sin, cos, tan, sqrt, log, random} = Math;
const {rgb, rgba, hsl} = Colour;

const pattern1 = new PatternRenderer('pattern1', function (x, y, param) {
    let c = 50 + sin(x * y * param) * y + param;
    return rgba(c % 255, c % 255, c % 255, c % 255);
}, AnimationParameter.unbounded(1, 0.01));
pattern1.draw();

const pattern2 = new PatternRenderer('pattern2', function (x, y, param) {
    let c = x * y * tan(100 * x * y * param);
    return rgba(0, 0, 100 + c % 150, 100 + c % 150);
}, AnimationParameter.bounded(0.001, 0, 1, 0.0001));
pattern2.draw();

const pattern3 = new PatternRenderer('pattern3', function (x, y) {
    let c = x * y * cos(x + y);
    return rgba(0, 100 + c % 150, 0, c % 255);
});
pattern3.draw();

const pattern4 = new PatternRenderer('pattern4', function (x, y) {
    let c = 10 * sqrt(pow(x, 2) + pow(y, 2));
    return rgba(c % 255, c % 255, c % 255, c % 255);
});
pattern4.draw();

const pattern5 = new PatternRenderer('pattern5', function (x, y) {
    let c = x * sin(y) * y * cos(x);
    return rgba(c % 255, c % 255, c % 255, 150);
});
pattern5.draw();

const pattern6 = new PatternRenderer('pattern6', function (x, y) {
    let c = sqrt(x * sin(y) * y * cos(x));
    return rgba(c % 255, c % 255, c % 255, 150);
});
pattern6.draw();

const pattern7 = new PatternRenderer('pattern7', function (x, y) {
    let r = random() * x + y;
    let g = random() * y + x;
    let b = random() * x * y;
    return rgba(r % 250, g % 250, b % 250, 150);
});
pattern7.draw();

const pattern8 = new PatternRenderer('pattern8', function (x, y, param) {
    let c = sin(x * y * param) * 255;
    return rgba(c % 255, c % 255, c % 255, 150);
}, AnimationParameter.bounded(1.0, 0.0001, 4, 0.001));
pattern8.draw();

const pattern9 = new PatternRenderer('pattern9', (x, y) => {
    let c = 10 * sqrt(pow(x, 3) + pow(y, 3));
    return rgba(0, 100 + c % 155, 0, 150);
});
pattern9.draw();

const pattern10 = new PatternRenderer('pattern10', function (x, y) {
    let c = 10 * pow(x, 1.33);
    return rgba(255, (150 + c) % 240, 15, 150);
});
pattern10.draw();

const pattern11 = new PatternRenderer('pattern11', function (x, y) {
    let c = sqrt(pow(x, 0.5) * pow(y, 0.25)) * 255;
    return rgba(c % 255, c % 255, c % 255, c % 255);
});
pattern11.draw();

const pattern12 = new PatternRenderer('pattern12', function (x, y) {
    let c = pow((pow(x, 3) * pow(y, 3)), 0.33) * 255;
    return rgba(c % 255, 0, 0, c % 255);
});
pattern12.draw();

const pattern13 = new PatternRenderer('pattern13', function (x, y) {
    let c = pow(sin(x * y) * cos(x * y), 2) * 255;
    return rgba(0, 0, c % 255, c % 255);
});
pattern13.draw();

const pattern14 = new PatternRenderer('pattern14', function (x, y) {
    let c = pow(pow(cos(x * y), 3), log(x * y)) * 255;
    return rgba(0, 0, c % 255, c % 255);
});
pattern14.draw();

const pattern15 = new PatternRenderer('pattern15', function (hue, saturation) {
    const luminosity = 0.5;
    return hsl(hue / this.width, saturation / this.height, luminosity);
});
pattern15.draw();

const pattern16 = new PatternRenderer('pattern16', function (hue) {
    const luminosity = 0.5, saturation = 0.5;
    return hsl(hue / this.width, saturation, luminosity);
});
pattern16.draw();

