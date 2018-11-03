const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;
let image = ctx.createImageData(width, height);

class FPS {
    constructor() {
        this.frameCounter = 0;
        this.fps = 0;
        this.second = 0;
    }

    inc() {
        let second = Math.floor(Date.now() / 1000);
        if (second > this.second) {
            this.fps = this.frameCounter;
            this.second = second;
            this.frameCounter = 0;
        }
        this.frameCounter++;
    }

    get() {
        return this.fps;
    }
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
        return this.distance(Vector2D.vec2d(0, 0));
    }

    normal() {
        let length = this.length();
        return Vector2D.vec2d(this.x / length, this.y / length);
    }

    static vec2d(x = 0, y = 0) {
        return new Vector2D(x, y);
    }

    toString() {
        return `vec2d(${this.x}, ${this.y})`;
    }
}

class Particle {
    constructor(position, velocity, charge, mass) {
        this.position = position;
        this.velocity = velocity;
        this.charge = charge;
        this.mass = mass;
        this.force = vec2d(0, 0);
    }

    static create(position, velocity, charge, mass) {
        return new Particle(position, velocity, charge, mass);
    }

    update() {
        this.position = this.position.add(this.velocity.scale(timeStep));
        this.velocity = this.velocity.add(this.force.scale(timeStep / this.mass));
    }

    equals(particle) {
        return this.position.equals(particle.position);
    }

    distance(particle) {
        return this.position.distance(particle);
    }

    toString() {
        return `Particle(position: ${this.position}, velocity: ${this.velocity}, charge: ${this.charge}, mass: ${this.mass}, force: ${this.force})`;
    }
}

const {vec2d} = Vector2D;
const {rgb} = Colour;
const particle = Particle.create;
const K = 8.996e9, timeStep = 20e-9;

class ParticleSystem {
    constructor(particles) {
        this.particles = particles;
        this.fps = new FPS();
    }

    static build(...particles) {
        return new ParticleSystem(particles);
    }

    start() {
        const animate = () => {
            this.$update();
            this.render();
            this.fps.inc();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        this.$logFPS()
    }

    render() {
        const scale = vec2d(10e-9 / width, 10e-9 / height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let screenPos = vec2d(x, y);
                let simulationPos = screenPos.mult(scale);
                let voltage = this.$voltageAt(simulationPos);
                let colour = voltage > 0 ? rgb(voltage * 8, 0, 0) : rgb(0, 0, -8 * voltage);

                setPixel(x, y, colour);
            }
        }
        ctx.putImageData(image, 0, 0)
    }

    $logFPS() {
        setInterval(() => {
            console.log(`fps: ${this.fps.get()}`)
        }, 1000);
    }

    $update() {
        // update forces
        for (let particle of this.particles) {
            particle.force = this.$calculateForce(particle);
        }

        // update position and velocity
        this.particles.forEach(particle => particle.update());
    }

    $voltageAt(point) {
        return this.particles.reduce((sum, particle) => sum + K * particle.charge / (particle.distance(point)), 0);
    }

    $calculateForce(particle1) {
        return this.particles.reduce((force, particle2) => {
            let vector = particle1.position.sub(particle2.position);
            let distance = vector.length();
            if (distance !== 0) {
                force = force.add(vector.normal().scale(K * particle1.charge * particle2.charge / distance * distance));
            }
            return force;
        }, vec2d());
    }
}

const particleSystem = ParticleSystem.build(
    particle(vec2d(47e-10, 50e-10), vec2d(0, 0), 20e-19, 10e-29),
    particle(vec2d(50e-10, 50e-10), vec2d(0, 0), -30e-19, 10e-18),
    particle(vec2d(53e-10, 53e-10), vec2d(0, 0), 20e-19, 10e-29)
);

particleSystem.start();
