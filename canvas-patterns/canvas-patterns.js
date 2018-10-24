class Colour {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static of(r, g, b, a) {
        return new Colour(r, g, b, a);
    }
}

class PatternRenderer {
    constructor(canvasId, computePixel) {
        let canvas = document.getElementById(canvasId);
        this.ctx = canvas.getContext('2d');
        this.ctx.fillStyle = "#FFFFFF";
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = this.ctx.createImageData(this.width, this.height);
        this.computePixel = computePixel;
    }

    draw() {
        this.clear();

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let {r, g, b, a} = this.computePixel(x, y);
                this.setPixel(r, g, b, a)
            }
        }

        this.ctx.putImageData(this.image, 0, 0);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    setPixel(x, y, r, g, b, a) {
        let index = (x + y * this.image.width) * 4;
        this.image.data[index] = r;
        this.image.data[index + 1] = g;
        this.image.data[index + 2] = b;
        this.image.data[index + 3] = a;
    }
}

const pattern1 = new PatternRenderer('pattern1', (x, y) => {
    let c = 50 + Math.sin(x * y) * y;
    return Colour.of(c, c, c, c);
});
pattern1.draw();

const pattern2 = new PatternRenderer('pattern2', (x, y) => {
    let c = x * y * Math.tan(100* x * y);
    return Colour.of(0, 0, 100 + c % 150, 100 + c % 150);
});
pattern2.draw();

const pattern3 = new PatternRenderer('pattern3', (x, y) => {
    let c = x * y * Math.cos(x + y);
    return Colour.of(0, 100 + c % 150, 0, c % 255);
});
pattern3.draw();

const pattern4 = new PatternRenderer('pattern4', (x, y) => {
    let c = 10 * Math.sqrt(x * x + y * y);
    return Colour.of(100 + c % 155, 100 + c % 155, 0, 150);
});
pattern4.draw();

const pattern5 = new PatternRenderer('pattern5', (x, y) => {
    let c = x * Math.sin(y) * y * Math.cos(x);
    return Colour.of(c % 255, c % 255, c % 255, 150);
});
pattern5.draw();

const pattern6 = new PatternRenderer('pattern6', (x, y) => {
    let c = Math.sqrt(x * Math.sin(y) * y * Math.cos(x));
    return Colour.of(c % 255, c % 255, c % 255, 150);
});
pattern6.draw();

const pattern7 = new PatternRenderer('pattern7', (x, y) => {
    let r = Math.random() * x + y;
    let g = Math.random() * y + x;
    let b = Math.random() * x * y;
    return Colour.of(r % 250, g % 250, b % 250, 150);
});
pattern7.draw();




