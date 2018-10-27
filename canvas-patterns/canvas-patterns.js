class Colour {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static rgba(r, g, b, a) {
        return new Colour(r, g, b, a);
    }
}

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
        this.computePixel = computePixel;
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

const pattern1 = new PatternRenderer('pattern1', (x, y, param) => {
    let c = 50 + Math.sin(x * y * param) * y + param;
    return Colour.rgba(c, c, c, c);
}, AnimationParameter.unbounded(1, 0.01));
pattern1.draw();

const pattern2 = new PatternRenderer('pattern2', (x, y, param) => {
    let c = x * y * Math.tan(100 * x * y * param);
    return Colour.rgba(0, 0, 100 + c % 150, 100 + c % 150);
}, AnimationParameter.bounded(0.001, 0, 1, 0.0001));
pattern2.draw();

const pattern3 = new PatternRenderer('pattern3', (x, y) => {
    let c = x * y * Math.cos(x + y);
    return Colour.rgba(0, 100 + c % 150, 0, c % 255);
});
pattern3.draw();

const pattern4 = new PatternRenderer('pattern4', (x, y) => {
    let c = 10 * Math.sqrt(x * x + y * y);
    return Colour.rgba(100 + c % 155, 100 + c % 155, 0, 150);
});
pattern4.draw();

const pattern5 = new PatternRenderer('pattern5', (x, y) => {
    let c = x * Math.sin(y) * y * Math.cos(x);
    return Colour.rgba(c % 255, c % 255, c % 255, 150);
});
pattern5.draw();

const pattern6 = new PatternRenderer('pattern6', (x, y) => {
    let c = Math.sqrt(x * Math.sin(y) * y * Math.cos(x));
    return Colour.rgba(c % 255, c % 255, c % 255, 150);
});
pattern6.draw();

const pattern7 = new PatternRenderer('pattern7', (x, y) => {
    let r = Math.random() * x + y;
    let g = Math.random() * y + x;
    let b = Math.random() * x * y;
    return Colour.rgba(r % 250, g % 250, b % 250, 150);
});
pattern7.draw();

const pattern8 = new PatternRenderer('pattern8', (x, y, param) => {
    let c = (Math.sin(x * y * param) * 255);
    return Colour.rgba(c % 255, c % 255, c % 255, 150);
}, AnimationParameter.bounded(1.0, 0.0001, 4, 0.001));
pattern8.draw();





