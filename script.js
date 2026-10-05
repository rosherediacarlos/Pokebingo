/* ============================================================
   CONFIGURACIÓN
============================================================ */

/*
    ⏱️ TIEMPO ENTRE CADA POKÉMON

    Está en milisegundos.

    3000 = 3 segundos
    5000 = 5 segundos
    8000 = 8 segundos
    10000 = 10 segundos

    Puedes cambiar SOLO este número.
*/

const DRAW_INTERVAL = 5000;


/*
    NÚMERO DE CASILLAS DEL CARTÓN
*/

const TOTAL_CELLS = 12;


/*
    LISTA DE POKÉMON
*/

const POKEMON = [
    {
        nombre: "Bulbasaur",
        imagen: "pokemon/bulbasaur.jpg"
    },
    {
        nombre: "Charmander",
        imagen: "pokemon/charmander.jpg"
    },
    {
        nombre: "Clefairy",
        imagen: "pokemon/clefairy.png"
    },
    {
        nombre: "Eevee",
        imagen: "pokemon/eevee.png"
    },
    {
        nombre: "Gengar",
        imagen: "pokemon/gengar.png"
    },
    {
        nombre: "Hawlucha",
        imagen: "pokemon/hawlucha.png"
    },
    {
        nombre: "Jigglypuff",
        imagen: "pokemon/jigglypuff.jpg"
    },
    {
        nombre: "Lapras",
        imagen: "pokemon/lapras.png"
    },
    {
        nombre: "Lilligant",
        imagen: "pokemon/lilligant.png"
    },
    {
        nombre: "Meloetta",
        imagen: "pokemon/meloetta.png"
    },
    {
        nombre: "Mew",
        imagen: "pokemon/mew.png"
    },
    {
        nombre: "Milotic",
        imagen: "pokemon/milotic.png"
    },
    {
        nombre: "Mimikyu",
        imagen: "pokemon/mimikyu.jpg"
    },
    {
        nombre: "Oricorio",
        imagen: "pokemon/oricorio.png"
    },
    {
        nombre: "Pikachu",
        imagen: "pokemon/pikachu.png"
    },
    {
        nombre: "Primarina",
        imagen: "pokemon/primarina.png"
    },
    {
        nombre: "Raichu de Alola",
        imagen: "pokemon/rauchu_alola.png"
    },
    {
        nombre: "Rockruff",
        imagen: "pokemon/rockruff.png"
    },
    {
        nombre: "Sprigatito",
        imagen: "pokemon/sprigatito.png"
    },
    {
        nombre: "Squirtle",
        imagen: "pokemon/squirtle.jpg"
    },
    {
        nombre: "Sylveon",
        imagen: "pokemon/sylveon.png"
    },
    {
        nombre: "Togepi",
        imagen: "pokemon/togepi.png"
    },
    {
        nombre: "Tsareena",
        imagen: "pokemon/tsareena.png"
    },
    {
        nombre: "Vulpix de Alola",
        imagen: "pokemon/vulpix_de_alola.png"
    }
];


/* ============================================================
   ESTADO DEL JUEGO
============================================================ */

let currentCard = [];

let markedCells = new Set();

let drawnPokemon = new Set();

let drawQueue = [];

let drawTimer = null;

let lineAlreadyWon = false;

let gameFinished = false;

let toastTimeout = null;


/* ============================================================
   ELEMENTOS HTML
============================================================ */

const bingoBoard =
    document.getElementById("bingoBoard");

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const currentDraw =
    document.getElementById("currentDraw");

const drawCount =
    document.getElementById("drawCount");

const drawProgressBar =
    document.getElementById("drawProgressBar");

const drawHistory =
    document.getElementById("drawHistory");

const historyCount =
    document.getElementById("historyCount");

const newCardButton =
    document.getElementById("newCardButton");

const toast =
    document.getElementById("toast");

const bingoOverlay =
    document.getElementById("bingoOverlay");

const noBingoOverlay =
    document.getElementById("noBingoOverlay");

const closeBingo =
    document.getElementById("closeBingo");

const closeNoBingo =
    document.getElementById("closeNoBingo");

const playAgainButton =
    document.getElementById("playAgainButton");

const playAgainNoBingo =
    document.getElementById("playAgainNoBingo");


/* ============================================================
   UTILIDADES
============================================================ */

function shuffle(array) {

    const copy = [...array];

    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            copy[i],
            copy[j]
        ] = [
            copy[j],
            copy[i]
        ];
    }

    return copy;
}


/*
    Busca un Pokémon por su nombre.
*/

function getPokemonByName(nombre) {

    return POKEMON.find(
        pokemon =>
            pokemon.nombre === nombre
    );
}


/* ============================================================
   CREAR CARTÓN
============================================================ */

function createNewCard() {

    stopDrawTimer();

    gameFinished = false;

    lineAlreadyWon = false;

    markedCells.clear();

    drawnPokemon.clear();

    /*
        Seleccionamos 12 Pokémon diferentes
        de los 24 disponibles.
    */

    currentCard =
        shuffle(POKEMON)
            .slice(0, TOTAL_CELLS);


    /*
        Creamos el bombo de Pokémon.

        Como hacemos shuffle una sola vez,
        cada Pokémon saldrá una única vez.
    */

    drawQueue =
        shuffle(POKEMON);


    renderBoard();

    resetDrawInterface();

    updateProgress();

    /*
        El primer Pokémon sale inmediatamente.
    */

    drawNextPokemon();


    /*
        Después seguimos sacando uno cada X segundos.
    */

    drawTimer =
        setInterval(
            drawNextPokemon,
            DRAW_INTERVAL
        );
}


/* ============================================================
   RENDER CARTÓN
============================================================ */

function renderBoard() {

    bingoBoard.innerHTML = "";

    currentCard.forEach(
        (pokemon, index) => {

            const cell =
                document.createElement("div");

            cell.className =
                "bingo-cell";

            cell.dataset.index =
                index;

            const image =
                document.createElement("img");

            image.src =
                pokemon.imagen;

            image.alt =
                pokemon.nombre;

            /*
                Si falta una imagen,
                mostramos un ? en lugar
                de romper el cartón.
            */

            image.onerror = function () {

                this.onerror = null;

                this.src =
                    createFallbackImage();
            };


            const name =
                document.createElement("div");

            name.className =
                "pokemon-name";

            name.textContent =
                pokemon.nombre;


            cell.appendChild(image);

            cell.appendChild(name);


            cell.addEventListener(
                "click",
                () => toggleCell(index, cell)
            );


            bingoBoard.appendChild(cell);
        }
    );
}


/* ============================================================
   IMAGEN FALLBACK
============================================================ */

function createFallbackImage() {

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="200"
                 height="200"
                 viewBox="0 0 200 200">

                <rect
                    width="200"
                    height="200"
                    rx="30"
                    fill="#17152d"
                />

                <text
                    x="100"
                    y="120"
                    text-anchor="middle"
                    font-size="80"
                    fill="white">
                    ?
                </text>

            </svg>
        `);
}


/* ============================================================
   SACAR SIGUIENTE POKÉMON
============================================================ */

function drawNextPokemon() {

    if (gameFinished) {
        return;
    }


    /*
        Si no quedan Pokémon en el bombo,
        termina la partida.
    */

    if (drawQueue.length === 0) {

        finishWithoutBingo();

        return;
    }


    /*
        Sacamos el siguiente.
    */

    const pokemon =
        drawQueue.shift();


    /*
        Guardamos que ya ha salido.
    */

    drawnPokemon.add(
        pokemon.nombre
    );


    /*
        Mostramos el Pokémon.
    */

    renderCurrentDraw(
        pokemon
    );


    /*
        Actualizamos historial.
    */

    renderDrawHistory();


    /*
        Actualizamos contador.
    */

    updateDrawProgress();


    /*
        Si está en el cartón,
        hacemos que brille.
    */

    highlightAvailableCell(
        pokemon
    );


    /*
        Si está en el cartón,
        damos una pequeña pista.
    */

    const isOnCard =
        currentCard.some(
            cardPokemon =>
                cardPokemon.nombre ===
                pokemon.nombre
        );

    if (isOnCard) {

        showToast(
            `✨ ¡Ha salido ${pokemon.nombre}! Lo tienes en tu cartón.`,
            "success"
        );
    }


    /*
        Si este era el último Pokémon
        y no ha habido BINGO,
        terminamos la partida.
    */

    if (
        drawQueue.length === 0 &&
        markedCells.size < TOTAL_CELLS
    ) {

        setTimeout(
            finishWithoutBingo,
            1000
        );
    }
}


/* ============================================================
   MOSTRAR POKÉMON ACTUAL
============================================================ */

function renderCurrentDraw(pokemon) {

    currentDraw.innerHTML = "";


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "draw-pokemon";


    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "draw-pokemon-image-wrapper";


    const image =
        document.createElement("img");

    image.className =
        "draw-pokemon-image";

    image.src =
        pokemon.imagen;

    image.alt =
        pokemon.nombre;

    image.onerror = function () {

        this.onerror = null;

        this.src =
            createFallbackImage();
    };


    const name =
        document.createElement("div");

    name.className =
        "draw-pokemon-name";

    name.textContent =
        pokemon.nombre;


    const status =
        document.createElement("div");

    status.className =
        "draw-pokemon-status";

    status.textContent =
        "✨ ¡HA SALIDO! ✨";


    imageWrapper.appendChild(
        image
    );

    wrapper.appendChild(
        imageWrapper
    );

    wrapper.appendChild(
        name
    );

    wrapper.appendChild(
        status
    );

    currentDraw.appendChild(
        wrapper
    );
}


/* ============================================================
   HISTORIAL DE POKÉMON
============================================================ */

function renderDrawHistory() {

    drawHistory.innerHTML = "";


    /*
        Convertimos el Set en array
        y mostramos el más reciente primero.
    */

    const history =
        [...drawnPokemon].reverse();


    if (history.length === 0) {

        drawHistory.innerHTML = `
            <div class="history-empty">
                Todavía no ha salido ningún Pokémon...
            </div>
        `;

        return;
    }


    history.forEach(
        (nombre, index) => {

            const pokemon =
                getPokemonByName(nombre);

            if (!pokemon) {
                return;
            }


            const item =
                document.createElement("div");

            item.className =
                "history-item";


            /*
                El primero del historial
                es el último Pokémon salido.
            */

            if (index === 0) {

                item.classList.add(
                    "current"
                );
            }


            const image =
                document.createElement("img");

            image.src =
                pokemon.imagen;

            image.alt =
                pokemon.nombre;

            image.onerror = function () {

                this.onerror = null;

                this.src =
                    createFallbackImage();
            };


            const name =
                document.createElement("span");

            name.textContent =
                pokemon.nombre;


            item.appendChild(image);

            item.appendChild(name);

            drawHistory.appendChild(item);
        }
    );


    historyCount.textContent =
        drawnPokemon.size;
}


/* ============================================================
   PROGRESO DEL BOMBO
============================================================ */

function updateDrawProgress() {

    const total =
        POKEMON.length;

    const current =
        drawnPokemon.size;


    drawCount.textContent =
        `${current} / ${total}`;


    const percentage =
        (current / total) * 100;


    drawProgressBar.style.width =
        `${percentage}%`;
}


/* ============================================================
   RESALTAR POKÉMON DISPONIBLE
============================================================ */

function highlightAvailableCell(pokemon) {

    currentCard.forEach(
        (cardPokemon, index) => {

            if (
                cardPokemon.nombre !==
                pokemon.nombre
            ) {
                return;
            }


            const cell =
                bingoBoard.querySelector(
                    `[data-index="${index}"]`
                );


            if (!cell) {
                return;
            }


            cell.classList.add(
                "available"
            );


            /*
                La clase se queda puesta mientras
                el Pokémon siga sin marcarse.

                Así la jugadora sabe cuáles
                puede marcar.
            */
        }
    );
}


/* ============================================================
   MARCAR / DESMARCAR CASILLA
============================================================ */

function toggleCell(index, cell) {

    if (gameFinished) {
        return;
    }


    const pokemon =
        currentCard[index];


    /*
        COMPROBAMOS SI EL POKÉMON
        YA HA SALIDO.
    */

    if (
        !drawnPokemon.has(
            pokemon.nombre
        )
    ) {

        cell.classList.remove(
            "not-available"
        );

        /*
            Forzamos reinicio de animación.
        */

        void cell.offsetWidth;

        cell.classList.add(
            "not-available"
        );


        showToast(
            `⏳ ${pokemon.nombre} todavía no ha salido. ¡Espera a que aparezca!`,
            "warning"
        );


        return;
    }


    /*
        SI YA ESTÁ MARCADO,
        LO DESMARCAMOS.
    */

    if (
        markedCells.has(index)
    ) {

        markedCells.delete(index);

        cell.classList.remove(
            "marked"
        );


        const stamp =
            cell.querySelector(".stamp");

        if (stamp) {
            stamp.remove();
        }

        return;
    }


    /*
        MARCAMOS.
    */

    markedCells.add(index);

    cell.classList.add(
        "marked"
    );


    /*
        Quitamos el brillo de
        "disponible".
    */

    cell.classList.remove(
        "available"
    );


    /*
        Creamos el sello.
    */

    const stamp =
        document.createElement("div");

    stamp.className =
        "stamp";

    cell.appendChild(
        stamp
    );


    /*
        Actualizamos progreso.
    */

    updateProgress();


    /*
        Comprobamos si hay línea.
    */

    checkForLine();


    /*
        Comprobamos BINGO.
    */

    checkForBingo();
}


/* ============================================================
   PROGRESO DEL CARTÓN
============================================================ */

function updateProgress() {

    const marked =
        markedCells.size;


    progressText.textContent =
        `${marked} / ${TOTAL_CELLS}`;


    const percentage =
        (marked / TOTAL_CELLS) * 100;


    progressBar.style.width =
        `${percentage}%`;
}


/* ============================================================
   COMPROBAR LÍNEAS
============================================================ */

function checkForLine() {

    if (lineAlreadyWon) {
        return;
    }


    /*
        Nuestro cartón tiene:

        4 columnas
        3 filas
        12 casillas
    */


    const rows = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11]
    ];


    for (const row of rows) {

        const completed =
            row.every(
                index =>
                    markedCells.has(index)
            );


        if (completed) {

            lineAlreadyWon = true;


            celebrateLine(
                row
            );


            showToast(
                "🎉 ¡Has conseguido tu primera Línea, ya estás más cerca de completarlo!",
                "success"
            );


            break;
        }
    }
}


/* ============================================================
   CELEBRACIÓN DE LÍNEA
============================================================ */

function celebrateLine(row) {

    row.forEach(
        index => {

            const cell =
                bingoBoard.querySelector(
                    `[data-index="${index}"]`
                );


            if (!cell) {
                return;
            }


            cell.classList.remove(
                "line-complete"
            );


            void cell.offsetWidth;


            cell.classList.add(
                "line-complete"
            );
        }
    );
}


/* ============================================================
   COMPROBAR BINGO
============================================================ */

function checkForBingo() {

    if (
        markedCells.size !==
        TOTAL_CELLS
    ) {
        return;
    }


    gameFinished = true;

    stopDrawTimer();


    setTimeout(
        showBingo,
        400
    );
}


/* ============================================================
   MOSTRAR BINGO
============================================================ */

function showBingo() {

    bingoOverlay.classList.add(
        "visible"
    );


    createConfetti();
}


/* ============================================================
   CONFETI
============================================================ */

function createConfetti() {

    const amount = 55;


    for (let i = 0; i < amount; i++) {

        const confetti =
            document.createElement("div");


        confetti.style.position =
            "fixed";

        confetti.style.left =
            `${Math.random() * 100}%`;

        confetti.style.top =
            "-20px";

        confetti.style.width =
            "8px";

        confetti.style.height =
            "14px";

        confetti.style.borderRadius =
            "2px";

        confetti.style.background =
            [
                "#ff9ed8",
                "#bba6ff",
                "#ffe59a",
                "#8de9ff",
                "#a8f5bd"
            ][
                Math.floor(
                    Math.random() * 5
                )
            ];

        confetti.style.zIndex =
            "300";

        confetti.style.pointerEvents =
            "none";


        document.body.appendChild(
            confetti
        );


        const duration =
            1800 +
            Math.random() * 2200;


        const rotation =
            Math.random() * 720 -
            360;


        const x =
            (Math.random() - .5) *
            300;


        confetti.animate(
            [
                {
                    transform:
                        "translate(0, 0) rotate(0)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(${x}px, 110vh) rotate(${rotation}deg)`,
                    opacity: 0
                }
            ],
            {
                duration,
                easing: "cubic-bezier(.2,.7,.3,1)"
            }
        );


        setTimeout(
            () => confetti.remove(),
            duration
        );
    }
}


/* ============================================================
   FIN SIN BINGO
============================================================ */

function finishWithoutBingo() {

    if (gameFinished) {
        return;
    }


    gameFinished = true;

    stopDrawTimer();


    setTimeout(
        () => {

            noBingoOverlay.classList.add(
                "visible"
            );

        },
        300
    );
}


/* ============================================================
   RESET INTERFAZ DE SORTEO
============================================================ */

function resetDrawInterface() {

    currentDraw.innerHTML = `
        <div class="draw-placeholder">

            <div class="placeholder-ball">
                ⚡
            </div>

            <strong>
                Preparando el bingo...
            </strong>

            <span>
                El primer Pokémon está a punto de salir
            </span>

        </div>
    `;


    drawCount.textContent =
        `0 / ${POKEMON.length}`;


    drawProgressBar.style.width =
        "0%";


    drawHistory.innerHTML = `
        <div class="history-empty">
            Todavía no ha salido ningún Pokémon...
        </div>
    `;


    historyCount.textContent =
        "0";
}


/* ============================================================
   PARAR TEMPORIZADOR
============================================================ */

function stopDrawTimer() {

    if (drawTimer !== null) {

        clearInterval(
            drawTimer
        );

        drawTimer = null;
    }
}


/* ============================================================
   TOAST
============================================================ */

function showToast(
    message,
    type = ""
) {

    clearTimeout(
        toastTimeout
    );


    toast.textContent =
        message;


    toast.className =
        "toast show";


    if (type) {

        toast.classList.add(
            type
        );
    }


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3200
        );
}


/* ============================================================
   BOTONES
============================================================ */

newCardButton.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "visible"
        );

        noBingoOverlay.classList.remove(
            "visible"
        );

        createNewCard();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


playAgainButton.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "visible"
        );

        createNewCard();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


playAgainNoBingo.addEventListener(
    "click",
    () => {

        noBingoOverlay.classList.remove(
            "visible"
        );

        createNewCard();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/*
    Los botones X simplemente cierran
    la ventana.

    La partida sigue terminada,
    por lo que para empezar otra hay
    que crear otro cartón.
*/

closeBingo.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "visible"
        );
    }
);


closeNoBingo.addEventListener(
    "click",
    () => {

        noBingoOverlay.classList.remove(
            "visible"
        );
    }
);


/* ============================================================
   INICIAR JUEGO
============================================================ */

createNewCard();