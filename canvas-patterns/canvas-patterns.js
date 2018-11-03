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

    static rgb(r, g, b) {
        return Colour.rgba(r, g, b, 255);
    }

    get rgb() {
        return [this.r, this.g, this.b];
    }

    get rgba() {
        return [this.r, this.g, this.b, this.a];
    }

    //Converts an RGB color value to HSL.
    get hsl() {
        let r = this.r / 255, g = this.g / 255, b = this.b / 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [h, s, l];
    }

    // Converts HSL color value to RGB. Assumes h, s, and l are contained in the set [0, 1].
    static hsl(h, s, l) {
        let r, g, b;

        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        if (s === 0) {
            r = g = b = l;
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return Colour.rgb(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
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

