const scores = document.querySelector('#score')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// array voor bullets en enemies die worden gemaakt
const bullets = []
const spawns = []
let score = 0

var audio = new Audio('./audio/whistle.mp3')

canvas.width = innerWidth
canvas.height = innerHeight

// maken van de player
class Player {
    constructor() {
        this.position = {
            x: canvas.width / 2,
            y: canvas.height - 80
        }

        this.speed = {
            x: 0,
            y: 0
        }

        this.opacity = 1

        this.image = new Image()
        this.image.src = './images/player.png'

        this.width = 80
        this.height = 80
        
    }

    draw() {
        c.globalAlpha = this.opacity
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    // bewegen van de player
    update() {
        this.draw()
        // speler kan niet van het beeld af gaan
        if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }
        if (this.position.x < 0) {
            this.position.x = 0;
        }        
        this.position.x += this.speed.x
    }
}

const player = new Player()

// maken van de bullets
class Bullet {
    constructor({position}){
        this.position = position
        this.speed = {
            x: 0,
            // snelheid van bullets
            y: -8
        }
        this.image = new Image()
        this.image.src = './images/bullet.png'

        this.width = 25
        this.height = 25
    }


    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw()
        this.position.x += this.speed.x
        this.position.y += this.speed.y
    }
}

// maken van de enemies
class Enemy {
    constructor({position}) {
        this.position = {
            x: position.x,
            y: position.y
        }

        this.speed = {
            x: 0,
            y: 0
        }

        this.image = new Image()
        this.image.src = './images/enemy.png'

        this.width = 60
        this.height = 60
        
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update({speed}) {
        this.draw()
        this.position.x += speed.x
        this.position.y += speed.y
        
    }
}
// maken van de enemy spawn zones
class Spawn {
    constructor(){
        this.position = {
            x: 0,
            y : 0
        }
        // snelheid van enemies
        this.speed = {
            x: 4,
            y: 0
        }

        this.enemies = []

        // maakt een willekeurig aantal enemies aan
        const columns = Math.floor(Math.random() * 10 + 8)
        const rows = Math.floor(Math.random() * 3 + 2)

        // maakt de enemy array even breed als het aantal enemies
        this.width = columns * 60

        // plaatst enemies naast en onder elkaar
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.enemies.push(new Enemy({position: {
                    x: x * 60,
                    y: y * 60
                }}))
            }
    }
}
    update() {
        this.position.x += this.speed.x
        this.position.y += this.speed.y

        this.speed.y = 0
        // beweegt de enemies een rij naar beneden en laat het de andere kant op gaan als het de rand van het scherm bereikt
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.speed.x = -this.speed.x
            this.speed.y = 60
        }
    }
}

// maken van meer enemies op willekeurig interval
let frames = 0
let randomSpawn = Math.floor((Math.random() * 500) + 500)
// animeren van het spel
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'grey'
    c.fillRect(0, 0, innerWidth, innerHeight)
    player.update()
    // verwijdert de bullet als hij buiten het scherm gaat
    bullets.forEach((bullet, i) => {
        if (bullet.position.y < 0) {
            bullets.splice(i, 1)
        }
        bullet.update()
    })
    // maakt enemies voor elke enemy groep in de spawns array
    spawns.forEach((spawn, spawnI) => {
        spawn.update()
        spawn.enemies.forEach((enemy, k) => {
            enemy.update({speed: spawn.speed})
            // stopt het spel als een enemy op dezelfde rij als de speler zit
            if (enemy.position.y + enemy.height > player.position.y){
                player.opacity = 0
            }
            // collision voor enemies en bullets
            bullets.forEach((bullet, i) => {
                if (bullet.position.y <= enemy.position.y + enemy.height && bullet.position.x + 25 <= enemy.position.x + enemy.width && bullet.position.x + 25 >= enemy.position.x && bullet.position.y + bullet.height >= enemy.position.y + enemy.height){
                    // verwijdert de geraakte enemy, kogel en verhoogt de score met 100
                    bullets.splice(i, 1)
                    spawn.enemies.splice(k, 1)
                    score += 100
                    // audio elke 3000 punten
                    if (score % 3000 === 0){
                        audio.play()
                    }

                    scores.innerHTML = score
                    // verandert de breedte van de enemy array als een kolom weg is
                    if (spawn.enemies.length > 0){
                        const leftEnemy = spawn.enemies[0]
                        const rightEnemy = spawn.enemies[spawn.enemies.length - 1]

                        spawn.width = rightEnemy.position.x - leftEnemy.position.x + rightEnemy.width
                        spawn.position.x = leftEnemy.position.x
                    }
                    // haalt enemy arrays weg waar geen enemies meer in zitten
                    else {
                        spawns.splice(spawnI, 1)
                    }
                }
            })
        })
    })
    // maakt willekeurig een nieuwe groep enemies
    if (frames % randomSpawn === 0) {
        spawns.push(new Spawn())
        randomSpawn = Math.floor((Math.random() * 600) + 700)
        frames = 0
    }

    frames++
}

animate()
// speler besturing
addEventListener('keydown', ({key}) => {
    // vergelijkt de key, keyboardEvent
    switch (key) {
        case 'ArrowLeft':
            // snelheid van speler 
            player.speed.x = -8         
            break
        case 'ArrowRight':
            player.speed.x = 8
            break
        case ' ':
            // maakt een nieuwe bullet aan en stopt het in de array
            bullets.push(
                new Bullet({
                    position: {
                        x: player.position.x + 26,
                        y: player.position.y - 20
                    },
                })
            )
            break
    }
})
// stopt de speler met bewegen als de arrowkey losgelaten wordt
addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'ArrowLeft':
            player.speed.x = 0
            break
        case 'ArrowRight':
            player.speed.x = 0
            break
    }
})