function novoElemento(tagName, className = '') {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = (x) => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'assets/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = (y) => this.elemento.style.bottom = `${y}px`

    window.onkeypress = () => {
        voando = true

        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        const novoY = this.getY() + 60

        if (novoY >= alturaMaxima) this.setY(alturaMaxima)
        else {
            this.setY(novoY)
            this.elemento.style.transform = "rotate(-30deg)"
        }
        setTimeout(() => {
            voando = false
        }, 80)
    }

    this.animar = (queda) => {
        if (!voando) {
            const novoY = this.getY() - queda
            if (novoY <= 0) this.setY(0)
            else {
                this.elemento.style.transform = "rotate(25deg)"
                this.setY(novoY)
            }
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = (pontos) => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elemA, elemB) {
    const a = elemA.getBoundingClientRect()
    const b = elemB.getBoundingClientRect()

    const horizontal = a.left + a.width - 20 >= b.left && b.left + b.width - 20 >= a.left
    const vertical = a.top + a.height - 10 >= b.top && b.top + b.height - 10 >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, inferior)
                || estaoSobrepostos(passaro.elemento, superior)
        }
    })
    return colidiu
}

function MenuRestart() {
    const button = novoElemento('button', 'restart outline')

    button.innerHTML = 'Restart'
    button.onclick = () => location.reload()

    this.elemento = novoElemento('div', 'restart')
    this.elemento.appendChild(button)
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar(5)

            if (colidiu(passaro, barreiras)) {
                window.onkeypress = null
                clearInterval(temporizador)
                const div = new MenuRestart()
                areaDoJogo.appendChild(div.elemento)
            }
        }, 20)
    }
}

new FlappyBird().start()