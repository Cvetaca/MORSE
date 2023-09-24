document.addEventListener("DOMContentLoaded", function () {
    const introScreen = document.querySelector(".intro");
    const mainScreen = document.querySelector(".main");
    const startButton = document.getElementById("startButton");
    const morseCharacter = document.getElementById("morseCharacter");
    const userInput = document.getElementById("userInput");
    const flashDot = document.getElementById("flash-dot");
    let generatedCharacters = generateRandomCharacters(); // Replace with your character generation logic
    let currentIndex = 0;
    let score = 0;
    let startTime;
    let playerId;

    startButton.addEventListener("click", () => {
        playerId = document.getElementById("playerId").value;
        if (playerId) {
            introScreen.style.display = "none";
            mainScreen.style.display = "block";
            startTime = Date.now();
            displayMorseCharacter();
        } else {
            alert("Please enter your name or ID.");
        }
    });

    userInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            const userChar = userInput.value.toUpperCase();
            const currentChar = generatedCharacters[currentIndex];

            if (userChar === currentChar) {
                score++;
            }

            currentIndex++;
            userInput.value = "";

            if (currentIndex < generatedCharacters.length) {
                displayMorseCharacter();
            } else {
                const totalTime = (Date.now() - startTime) / 1000;
                sendDataToServer(playerId, generatedCharacters, score, totalTime);
            }
        }
    });

    function generateRandomCharacters() {
        // Replace this with your character generation logic.
        // For now, we generate random characters from A to Z.
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomCharacters = [];
        for (let i = 0; i < 16; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomCharacters.push(characters[randomIndex]);
        }
        return randomCharacters.join("");
    }

    function displayMorseCharacter() {
        const currentChar = generatedCharacters[currentIndex];
        morseCharacter.textContent = currentChar;
        flashDot.style.animation = "flash 1s infinite alternate";
    }

    function sendDataToServer(playerId, generatedCharacters, score, totalTime) {
        const data = {
            id: playerId,
            gChar: generatedCharacters,
            aChar: "User's answers", // Replace with the actual user's answers
            score: score,
            totalTime: totalTime
        };

        fetch('https://morse.valentincic.eu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server here
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
