const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;
let image = ctx.createImageData(width, height);

function getTime() {
    return new Date().getTime();
}

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
        return Vector2D.vec2d(this.x * vec.x, this.y * vec.y);
    }

    add(vec) {
        return Vector2D.vec2d(this.x + vec.x, this.y + vec.y);
    }

    scale(value) {
        return Vector2D.vec2d(this.x * value, this.y * value);
    }

    sub(vec) {
        return this.add(vec.negate());
    }

    negate() {
        return Vector2D.vec2d(-this.x, -this.y);
    }

    distance(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }

    length() {
        return this.distance(Vector2D.zero());
    }

    normal() {
        let length = this.length();
        return Vector2D.vec2d(this.x / length, this.y / length);
    }

    equals(particle) {
        return this.x === particle.x && this.y === particle.y;
    }

    static zero() {
        return Vector2D.vec2d(0, 0);
    }

    static vec2d(x, y) {
        return new Vector2D(x, y);
    }
}

let {vec2d} = Vector2D;

class Particle {
    constructor(position, velocity, charge, mass) {
        this.position = position;
        this.velocity = velocity;
        this.charge = charge;
        this.mass = mass;
        this.force = Vector2D.zero();
    }

    equals(particle) {
        return this.position.equals(particle.position);
    }

    static create(position, velocity, charge, mass) {
        return new Particle(position, velocity, charge, mass);
    }
}

const K = 8.996e9, EPS = 10e-80;
let timeStep = 6e-14;
let lastParticle = getTime();
let sign = 1;

let particles = [
    Particle.create(vec2d(47e-10,50e-10,0), Vector2D.zero(), 20e-19, 10e-29),
    Particle.create(vec2d(50e-10,50e-10,0), Vector2D.zero(), -28e-19, 10e-29),
    Particle.create(vec2d(53e-10,53e-10,0), Vector2D.zero(), 21e-19, 10e-29)
];

function voltageAt(point) {

    let voltage = 0;

    for (let particle of particles) {
        voltage += K * particle.charge / (EPS + particle.position.distance(point))
    }

    return voltage;
}

function update() {
    // update forces
    for (let particle of particles) {
        particle.force = calculateForce(particle);
    }

    // update position and velocity
    for (let particle of particles) {
        particle.position = particle.position.add(particle.velocity.scale(timeStep));
        particle.velocity = particle.velocity.add(particle.force.scale(timeStep / particle.mass));
    }
}

function calculateForce(particle) {
    let particle1 = particle;
    let force = vec2d(0, 0);

    for (let particle2 of particles) {
        let vec = particle1.position.sub(particle2.position);
        let length = vec.length();

        if (length > EPS) {
            force = force.add(vec.normal().scale(K * (particle1.charge * particle2.charge) / length));
        }
    }

    return force;
}
/*
function updateForces() {
    /!*const positive = 1, negative = -1;

    if (getTime() - lastParticle > 2000) {
        let px = Math.random() / 100000000;
        let py = Math.random() / 100000000;
        //let type = Math.random() < 0.5 ? negative : positive;
        let charge = sign * Math.random() * 20 * 10e-20 * (Math.random() < 0.5);
        sign *= -1;
        particles.push(Particle.create(vec2d(px, py), vec2d(47e-10, 50e-10), charge, 10e-29));

        lastParticle = getTime();
    }*!/

}*/

function render() {
    const scale = vec2d(10e-9 / width, 10e-9 / height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let screenPos = vec2d(x, y);
            let simulationPos = screenPos.mult(scale);
            let voltage = voltageAt(simulationPos);
            let colour = voltage > 0 ? Colour.rgb(voltage * 2, 0, 0) : Colour.rgb(0, 0, -2 * voltage);

            setPixel(x, y, colour);
        }
    }
    ctx.putImageData(image, 0, 0)
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

animate();
