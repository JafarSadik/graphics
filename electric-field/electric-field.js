import {Vector2D, FPS, Colour} from 'canvas-sandbox'

const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;
let image = ctx.createImageData(width, height);


function setPixel(x, y, colour) {
    let index = (x + y * image.width) * 4;
    image.data[index] = colour.r;
    image.data[index + 1] = colour.g;
    image.data[index + 2] = colour.b;
    image.data[index + 3] = colour.a;
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

const vec2d = Vector2D.vec2d, rgb = Colour.rgb, particle = Particle.create;
const K = 8.996e9, timeStep = 20e-9;

const requestAnimationFrame = requestAnimationFrame || ((fun) => setTimeout(fun, 20));

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