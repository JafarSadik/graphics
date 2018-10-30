
const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
let width = canvas.width, height = canvas.height;
let image = ctx.createImageData(width, height);

class Colour {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

function rgba(r, g, b, a) {
    return new Colour(r, g, b, a);
}

function rgb(r, g, b) {
    return rgba(r, g, b, 255);
}

function setPixel(x, y, colour) {
    let index = (x + y * image.width) * 4;
    image.data[index] = colour.r;
    image.data[index + 1] = colour.g;
    image.data[index + 2] = colour.b;
    image.data[index + 3] = colour.a;
}

class Vector2D {
    constructor(x, y) {
        this.components = {x, y}
    }

    get x() {
        return this.components.x;
    }

    set x(x) {
        this.components.x = x;
    }

    get y() {
        return this.components.y;
    }

    set y(y) {
        this.components.y = y;
    }

    mult(vec) {
        return vec2d(this.x * vec.x, this.y * vec.y);
    }

    add(vec) {
        return vec2d(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return this.add(vec.negate());
    }

    negate() {
        return vec2d(-this.x, -this.y);
    }

    distance(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }
}

function vec2d(x, y) {
    return new Vector2D(x, y);
}

class Particle {
    constructor(position, speed, charge, mass) {
        this.position = position;
        this.speed = speed;
        this.charge = charge;
        this.mass = mass;
    }

    distance(point) {
        return this.position.distance(point);
    }

    static create(position, speed, charge, mass) {
        return new Particle(position, speed, charge, mass);
    }
}

let particles = [
    Particle.create(vec2d(47e-10,50e-10), vec2d(47e-10,50e-10), 20e-19, 10e-29),
    Particle.create(vec2d(50e-10,50e-10), vec2d(50e-10,50e-10), -28e-19, 10e-29),
    Particle.create(vec2d(53e-10,53e-10), vec2d(53e-10,53e-10), 21e-19, 10e-29)
];

function voltageAt(point) {
    const K = 8.996e9;
    let voltage = 0;

    for (let particle of particles) {
        voltage += K * particle.charge / (10e-30 + particle.distance(point))
    }

    return voltage;
}

function render() {
    const scale = vec2d(10e-9 / width, 10e-9 / height);
    const screenOffset = vec2d(0, 0);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let screenPos = vec2d(x, y).add(screenOffset);
            let simulationPos = screenPos.mult(scale);
            let voltage = voltageAt(simulationPos);
            let colour = voltage > 0 ? rgb(voltage * 10, 0, 0) : rgb(0, 0, -voltage * 10);
            setPixel(x, y, colour);
        }
    }
    ctx.putImageData(image, 0, 0)
}

render();