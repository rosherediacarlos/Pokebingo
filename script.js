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
    ⏳ TIEMPO EXTRA DESPUÉS DEL ÚLTIMO POKÉMON

    Cuando sale el Pokémon número 24,
    dejamos unos segundos para poder marcarlo
    antes de mostrar que no hubo BINGO.

    3000 = 3 segundos
    5000 = 5 segundos
    8000 = 8 segundos
*/

const FINAL_DRAW_GRACE_PERIOD = 5000;


/*
    NÚMERO DE CASILLAS DEL CARTÓN
*/

const TOTAL_CELLS = 12;


/* ============================================================
   LISTA DE POKÉMON
============================================================ */

const POKEMON = [

    {
        nombre: "Bulbasaur",
        imagen: "pokemon/bulbasaur.png"
    },

    {
        nombre: "Charmander",
        imagen: "pokemon/charmander.png"
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
        imagen: "pokemon/jigglypuff.png"
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
        imagen: "pokemon/mimikyu.png"
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
        imagen: "pokemon/squirtle.png"
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

let drawnPokemon = [];

let drawQueue = [];

let drawTimer = null;

let finalDrawTimeout = null;

let lineAlreadyWon = false;

let gameFinished = false;

let toastTimeout = null;


/* ============================================================
   ELEMENTOS DEL DOM
============================================================ */

const bingoBoard =
    document.getElementById("bingoBoard");

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

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const toast =
    document.getElementById("toast");

const bingoOverlay =
    document.getElementById("bingoOverlay");

const noBingoOverlay =
    document.getElementById("noBingoOverlay");

const newCardButton =
    document.getElementById("newCardButton");

const playAgainButton =
    document.getElementById("playAgainButton");

const playAgainNoBingo =
    document.getElementById("playAgainNoBingo");

const closeBingo =
    document.getElementById("closeBingo");

const closeNoBingo =
    document.getElementById("closeNoBingo");


/* ============================================================
   MÚSICA
============================================================ */

const backgroundMusic =
    document.getElementById("backgroundMusic");

const musicToggle =
    document.getElementById("musicToggle");

const musicVolume =
    document.getElementById("musicVolume");


backgroundMusic.volume = 0.35;


function updateMusicButton() {

    if (backgroundMusic.paused) {

        musicToggle.textContent = "🎵";

        musicToggle.setAttribute(
            "aria-label",
            "Reproducir música"
        );

        musicToggle.title =
            "Reproducir música";

    } else {

        musicToggle.textContent = "🔊";

        musicToggle.setAttribute(
            "aria-label",
            "Pausar música"
        );

        musicToggle.title =
            "Pausar música";
    }
}


musicToggle.addEventListener(
    "click",
    async () => {

        try {

            if (backgroundMusic.paused) {

                await backgroundMusic.play();

            } else {

                backgroundMusic.pause();

            }

            updateMusicButton();

        } catch (error) {

            console.warn(
                "No se pudo reproducir la música:",
                error
            );

            showToast(
                "🎵 Pulsa de nuevo para iniciar la música.",
                "warning"
            );
        }

    }
);


musicVolume.addEventListener(
    "input",
    () => {

        backgroundMusic.volume =
            Number(musicVolume.value);

    }
);


backgroundMusic.addEventListener(
    "play",
    updateMusicButton
);


backgroundMusic.addEventListener(
    "pause",
    updateMusicButton
);


backgroundMusic.addEventListener(
    "ended",
    updateMusicButton
);


updateMusicButton();


/* ============================================================
   SONIDOS
============================================================ */

const markSound =
    document.getElementById("markSound");


const lineSound =
    document.getElementById("lineSound");


/*
 * Volumen independiente del sonido de marcado.
 * Lo dejamos bajito para que sea sutil.
 */

markSound.volume = 0.45;


function playLineSound() {

    try {

        lineSound.currentTime = 0;

        const playPromise =
            lineSound.play();

        if (playPromise !== undefined) {

            playPromise.catch(() => {
                // El navegador puede bloquear el audio.
            });

        }

    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido de línea:",
            error
        );

    }
}


function playMarkSound() {

    try {

        /*
         * Reiniciamos el sonido antes de reproducirlo.
         * Así se puede marcar rápidamente varias casillas
         * sin que se acumulen reproducciones.
         */

        markSound.currentTime = 0;

        const playPromise =
            markSound.play();

        if (playPromise !== undefined) {

            playPromise.catch(() => {
                /*
                 * Si el navegador bloquea el sonido,
                 * simplemente no hacemos nada.
                 */
            });

        }

    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido de marcado:",
            error
        );

    }
}


/* ============================================================
   UTILIDADES
============================================================ */

function shuffle(array) {

    const result =
        [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


function getPokemonByName(nombre) {

    return POKEMON.find(
        pokemon =>
            pokemon.nombre === nombre
    );
}


/* ============================================================
   CREAR NUEVO CARTÓN
============================================================ */

function createNewCard() {

    stopDrawTimer();

    clearFinalDrawTimeout();


    currentCard =
        shuffle(POKEMON)
            .slice(0, TOTAL_CELLS);


    markedCells =
        new Set();


    drawnPokemon =
        [];


    drawQueue =
        shuffle(POKEMON);


    lineAlreadyWon =
        false;


    gameFinished =
        false;


    resetDrawInterface();

    renderBoard();

    updateProgress();

    drawNextPokemon();


    drawTimer =
        setInterval(
            drawNextPokemon,
            DRAW_INTERVAL
        );
}


/* ============================================================
   RENDERIZAR CARTÓN
============================================================ */

function renderBoard() {

    bingoBoard.innerHTML = "";


    currentCard.forEach(
        (pokemon, index) => {

            const cell =
                document.createElement("button");


            cell.type = "button";


            cell.className =
                "bingo-cell";


            cell.dataset.index =
                index;


            cell.dataset.name =
                pokemon.nombre;


            const image =
                document.createElement("img");


            image.src =
                pokemon.imagen;


            image.alt =
                pokemon.nombre;


            image.loading =
                "lazy";


            image.addEventListener(
                "error",
                () => {

                    createFallbackImage(
                        image,
                        pokemon.nombre
                    );

                },
                {
                    once: true
                }
            );


            const name =
                document.createElement("span");


            name.className =
                "pokemon-name";


            name.textContent =
                pokemon.nombre;


            const stamp =
                document.createElement("div");


            stamp.className =
                "cell-stamp";


            stamp.innerHTML =
                "✓";


            cell.appendChild(image);

            cell.appendChild(name);

            cell.appendChild(stamp);


            cell.addEventListener(
                "click",
                () => {

                    toggleCell(
                        index
                    );

                }
            );


            bingoBoard.appendChild(cell);

        }
    );

}


/* ============================================================
   FALLBACK PARA IMÁGENES
============================================================ */

function createFallbackImage(
    image,
    pokemonName
) {

    image.removeAttribute("src");


    image.alt =
        pokemonName;


    image.classList.add(
        "image-error"
    );


    image.style.display =
        "none";


    const fallback =
        document.createElement("div");


    fallback.className =
        "image-fallback";


    fallback.textContent =
        "?";


    image.parentElement.insertBefore(
        fallback,
        image
    );
}


/* ============================================================
   SACAR SIGUIENTE POKÉMON
============================================================ */

function drawNextPokemon() {

    if (gameFinished) {

        stopDrawTimer();

        return;
    }


    /*
     * Si ya no quedan Pokémon en la cola,
     * no hacemos nada.
     *
     * El resultado final se controla mediante
     * el temporizador especial del último Pokémon.
     */

    if (drawQueue.length === 0) {

        stopDrawTimer();

        return;
    }


    const pokemon =
        drawQueue.shift();


    drawnPokemon.push(
        pokemon
    );


    renderCurrentDraw(
        pokemon
    );


    renderDrawHistory();


    updateDrawProgress();


    highlightAvailableCell(
        pokemon.nombre
    );


    /*
     * Si este era el último Pokémon del bombo,
     * NO mostramos inmediatamente que se ha perdido.
     *
     * Dejamos un pequeño margen de tiempo para que
     * pueda marcarlo y conseguir el BINGO.
     */

    if (
        drawQueue.length === 0 &&
        !gameFinished
    ) {

        stopDrawTimer();


        clearFinalDrawTimeout();


        finalDrawTimeout =
            setTimeout(
                () => {

                    finalDrawTimeout =
                        null;


                    if (!gameFinished) {

                        finishWithoutBingo();

                    }

                },
                FINAL_DRAW_GRACE_PERIOD
            );

    }
}


/* ============================================================
   POKÉMON ACTUAL
============================================================ */

function renderCurrentDraw(
    pokemon
) {

    currentDraw.innerHTML = `

        <div class="draw-pokemon">

            <div class="draw-pokemon-image-wrapper">

                <img
                    class="draw-pokemon-image"
                    src="${pokemon.imagen}"
                    alt="${pokemon.nombre}"
                >

            </div>

            <div class="draw-pokemon-info">

                <span>
                    ¡HA SALIDO!
                </span>

                <strong>
                    ${pokemon.nombre}
                </strong>

            </div>

        </div>

    `;


    const image =
        currentDraw.querySelector(
            ".draw-pokemon-image"
        );


    if (image) {

        image.addEventListener(
            "error",
            () => {

                image.style.display =
                    "none";

            },
            {
                once: true
            }
        );

    }
}


/* ============================================================
   HISTORIAL
============================================================ */

function renderDrawHistory() {

    historyCount.textContent =
        drawnPokemon.length;


    if (
        drawnPokemon.length === 0
    ) {

        drawHistory.innerHTML = `

            <div class="history-empty">
                Todavía no ha salido ningún Pokémon...
            </div>

        `;

        return;
    }


    drawHistory.innerHTML = "";


    drawnPokemon
        .slice()
        .reverse()
        .forEach(
            pokemon => {

                const item =
                    document.createElement("div");


                item.className =
                    "history-item";


                const image =
                    document.createElement("img");


                image.src =
                    pokemon.imagen;


                image.alt =
                    pokemon.nombre;


                const name =
                    document.createElement("span");


                name.textContent =
                    pokemon.nombre;


                item.appendChild(
                    image
                );


                item.appendChild(
                    name
                );


                drawHistory.appendChild(
                    item
                );

            }
        );
}


/* ============================================================
   PROGRESO DEL BOMBO
============================================================ */

function updateDrawProgress() {

    const count =
        drawnPokemon.length;


    drawCount.textContent =
        `${count} / ${POKEMON.length}`;


    const percentage =
        (
            count /
            POKEMON.length
        ) * 100;


    drawProgressBar.style.width =
        `${percentage}%`;
}


/* ============================================================
   ILUMINAR POKÉMON DISPONIBLES
============================================================ */

function highlightAvailableCell(
    pokemonName
) {

    const cells =
        bingoBoard.querySelectorAll(
            ".bingo-cell"
        );


    cells.forEach(
        cell => {

            if (
                cell.dataset.name ===
                pokemonName
            ) {

                cell.classList.add(
                    "available"
                );

            }

        }
    );
}


/* ============================================================
   MARCAR / DESMARCAR CASILLA
============================================================ */

function toggleCell(index) {

    if (gameFinished) {
        return;
    }


    const pokemon =
        currentCard[index];


    const cell =
        bingoBoard.querySelector(
            `[data-index="${index}"]`
        );


    /*
     * Si todavía no ha salido,
     * no permitimos marcarlo.
     */

    if (
        !drawnPokemon.some(
            item =>
                item.nombre ===
                pokemon.nombre
        )
    ) {

        cell.classList.remove(
            "not-available"
        );


        /*
         * Forzamos reinicio de la animación
         * para que vuelva a vibrar cada vez.
         */

        void cell.offsetWidth;


        cell.classList.add(
            "not-available"
        );


        showToast(
            "⏳ Este Pokémon todavía no ha salido.",
            "warning"
        );


        setTimeout(
            () => {

                cell.classList.remove(
                    "not-available"
                );

            },
            500
        );


        return;
    }


    /*
     * Si ya estaba marcado,
     * permitimos desmarcarlo.
     */

    if (
        markedCells.has(index)
    ) {

        markedCells.delete(
            index
        );


        cell.classList.remove(
            "marked"
        );


        const stamp =
            cell.querySelector(
                ".cell-stamp"
            );


        if (stamp) {

            stamp.classList.remove(
                "show"
            );

        }


        updateProgress();


        return;
    }


    /*
     * MARCAR CASILLA
     */

    markedCells.add(
        index
    );


    cell.classList.add(
        "marked"
    );


    const stamp =
        cell.querySelector(
            ".cell-stamp"
        );


    if (stamp) {

        stamp.classList.add(
            "show"
        );

    }


    /*
     * 🔊 Sonido sutil de marcado.
     */

    playMarkSound();


    /*
     * Actualizamos el contador.
     */

    updateProgress();


    /*
     * Comprobamos línea.
     */

    checkForLine();


    /*
     * Comprobamos BINGO.
     */

    checkForBingo();


    /*
     * Si este era el último Pokémon del bombo
     * y todavía no hemos conseguido BINGO,
     * el temporizador de gracia seguirá activo.
     *
     * Si conseguimos BINGO, checkForBingo()
     * habrá puesto gameFinished = true y
     * cancelaremos ese temporizador.
     */

}


/* ============================================================
   ACTUALIZAR PROGRESO DEL CARTÓN
============================================================ */

function updateProgress() {

    const count =
        markedCells.size;


    progressText.textContent =
        `${count} / ${TOTAL_CELLS}`;


    const percentage =
        (
            count /
            TOTAL_CELLS
        ) * 100;


    progressBar.style.width =
        `${percentage}%`;
}


/* ============================================================
   COMPROBAR LÍNEA
============================================================ */

function checkForLine() {

    if (lineAlreadyWon) {
        return;
    }


    const rows = [

        [0, 1, 2, 3],

        [4, 5, 6, 7],

        [8, 9, 10, 11]

    ];


    const completedRow =
        rows.some(
            row =>
                row.every(
                    index =>
                        markedCells.has(index)
                )
        );


    if (!completedRow) {
        return;
    }


    lineAlreadyWon =
        true;


    celebrateLine();
}


/* ============================================================
   CELEBRAR LÍNEA
============================================================ */

function celebrateLine() {

    playLineSound();


    showToast(
        "Has conseguido tu primera Línea, ya estás más cerca de completarlo",
        "success"
    );


    /*
     * Pequeño efecto visual en el cartón.
     */

    bingoBoard.classList.add(
        "line-complete"
    );


    setTimeout(
        () => {

            bingoBoard.classList.remove(
                "line-complete"
            );

        },
        900
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


    if (gameFinished) {
        return;
    }


    /*
     * Hemos conseguido BINGO.
     *
     * Cancelamos el temporizador especial
     * del último Pokémon, si estaba activo.
     */

    clearFinalDrawTimeout();


    gameFinished =
        true;


    stopDrawTimer();


    setTimeout(
        () => {

            showBingo();

        },
        400
    );
}


/* ============================================================
   MOSTRAR BINGO
============================================================ */

function showBingo() {

    // 🔊 Reproducir el mismo sonido de la línea
    playLineSound();


    bingoOverlay.classList.add(
        "show"
    );


    createConfetti();
}


/* ============================================================
   CONFETI
============================================================ */

function createConfetti() {

    const symbols = [
        "✨",
        "⭐",
        "💖",
        "🌱",
        "⚡",
        "🎉",
        "🥳"
    ];


    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const confetti =
            document.createElement("div");


        confetti.className =
            "confetti";


        confetti.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        confetti.style.left =
            `${Math.random() * 100}%`;


        confetti.style.animationDelay =
            `${Math.random() * 1.5}s`;


        confetti.style.animationDuration =
            `${2 + Math.random() * 2}s`;


        document.body.appendChild(
            confetti
        );


        setTimeout(
            () => {

                confetti.remove();

            },
            4500
        );
    }
}


/* ============================================================
   FINAL SIN BINGO
============================================================ */

function finishWithoutBingo() {

    if (gameFinished) {
        return;
    }


    /*
     * Cancelamos cualquier temporizador pendiente
     * relacionado con el último Pokémon.
     */

    clearFinalDrawTimeout();


    gameFinished =
        true;


    stopDrawTimer();


    noBingoOverlay.classList.add(
        "show"
    );
}


/* ============================================================
   REINICIAR INTERFAZ DEL BOMBO
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
        "0 / 24";


    drawProgressBar.style.width =
        "0%";


    historyCount.textContent =
        "0";


    drawHistory.innerHTML = `

        <div class="history-empty">
            Todavía no ha salido ningún Pokémon...
        </div>

    `;
}


/* ============================================================
   DETENER TEMPORIZADOR
============================================================ */

function stopDrawTimer() {

    if (drawTimer !== null) {

        clearInterval(
            drawTimer
        );

        drawTimer =
            null;
    }
}


/* ============================================================
   DETENER TEMPORIZADOR DEL ÚLTIMO POKÉMON
============================================================ */

function clearFinalDrawTimeout() {

    if (finalDrawTimeout !== null) {

        clearTimeout(
            finalDrawTimeout
        );

        finalDrawTimeout =
            null;
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
        "toast";


    if (type) {

        toast.classList.add(
            type
        );

    }


    toast.classList.add(
        "show"
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* ============================================================
   BOTONES
============================================================ */

newCardButton.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "show"
        );


        noBingoOverlay.classList.remove(
            "show"
        );


        createNewCard();

    }
);


playAgainButton.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "show"
        );


        createNewCard();

    }
);


playAgainNoBingo.addEventListener(
    "click",
    () => {

        noBingoOverlay.classList.remove(
            "show"
        );


        createNewCard();

    }
);


closeBingo.addEventListener(
    "click",
    () => {

        bingoOverlay.classList.remove(
            "show"
        );

    }
);


closeNoBingo.addEventListener(
    "click",
    () => {

        noBingoOverlay.classList.remove(
            "show"
        );

    }
);


/* ============================================================
   INICIAR BINGO
============================================================ */

createNewCard();