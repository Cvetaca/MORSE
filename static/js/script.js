async function startScreen() {
  let mouseX = 0;
  let mouseY = 0;
  let flashlightCircle = document.getElementById("flashlightCircle");
  const isTouchDevice = () => {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  };
  function getMousePosition(e) {
    mouseX = !isTouchDevice() ? e.pageX : e.touches[0].pageX;
    mouseY = !isTouchDevice() ? e.pageY : e.touches[0].pageY;
    flashlightCircle.style.setProperty("--Xpos", mouseX + "px");
    flashlightCircle.style.setProperty("--Ypos", mouseY + "px");
  }
  document.addEventListener("mousemove", getMousePosition);
  document.addEventListener("touchmove", getMousePosition);
  const checkbox = document.getElementById('competitionMode');
  startButton = document.getElementById("start")


  startButton.addEventListener("click", async () => {
    if (document.getElementById("ID").value == "") {
      alert("Enter name or ID!")
      return
    }else if(document.getElementById("st").value==""){
      alert("Enter the number of characters for the game!")
      return
    }else if(document.getElementById("ID").value.length>16){
      alert("Maximum name length is 16 characters!")
      return
    }
    const level = document.getElementById("level").value
    const id = document.getElementById("ID").value
    const num=document.getElementById("st").value
    const tmpMode=document.getElementById("modeText").innerHTML
    let mode;
    if(tmpMode==="Practice")mode=false
    else mode=true
    isTransitioning = true;
    flashlightCircle.style.opacity = "0";
    document.getElementById("container").style.visibility="hidden"
    checkbox.removeEventListener('change',toggle)
    
    document.body.style.setProperty("cursor", "none")
    document.body.style.setProperty("caret-color", "transparent")
    document.removeEventListener("mousemove", getMousePosition);
    document.removeEventListener("touchmove", getMousePosition);
    startButton.disabled = true; // Disable the button
    $('.switch').css('opacity','0');
    $('.slider').css('opacity','0');
    //await new Promise(r => setTimeout(r, 2000));
    startGame(id, level,num,mode)
    return

  });
  // Get the checkbox and mode text element
    const modeText = document.getElementById('modeText');
    function toggle(){
      if (this.checked) {
        modeText.textContent = 'Competition';
        document.getElementById("st").value=30;
        document.getElementById("st").disabled=true
    } else {
        modeText.textContent = 'Practice';
        document.getElementById("st").value="";
        document.getElementById("st").disabled=false
    }
    }
    // Add an event listener to the checkbox
    checkbox.addEventListener('change', toggle);
  return
}

function generateChallenge(challengelength) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  challenge = [];

  for (let i = 0; i < challengelength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters.charAt(randomIndex);
    challenge.push(randomCharacter.toUpperCase());
  }

  return challenge
}

async function startGame(id, level,challengelength,competitionMode) {
  //console.log(competitionMode)
  //console.log(id, level)
  var counter = 3;

  var timer = setInterval(function () {

    $('#countdown').remove();

    var countdown = $('<span id="countdown">' + (counter == 0 ? '' : counter) + '</span>');
    countdown.appendTo($('.container'));
    setTimeout(() => {
      if (counter > -1) {
        $('#countdown').css({ 'font-size': '40vw', 'opacity': 0 });
      } else {
        $('#countdown').css({ 'font-size': '10vw', 'opacity': 90 });
      }
    }, 20);
    counter--;
    if (counter == -1) clearInterval(timer);
  }, 1000);
  let pause, lLength, sLength,mode
  switch (level) {
    case "0":
      mode="Easy"
      pause = 250
      lLength = 600
      sLength = 200
      break;
    case "1":
      mode="Hard"
      pause = 110
      lLength = 340
      sLength = 110
      break;

    default:
      mode="Champion"
      pause = 80
      lLength = 210
      sLength = 60
      break;
  }

  let challenge = await generateChallenge(challengelength)
  await new Promise(r => setTimeout(r, 3000));
  let userInput = []
  let startTime = Date.now()
  /*function waitForUserInput() {
    return new Promise((resolve) => {
      document.addEventListener('keydown', function handleKey(event) {
        userInput.push(event.key.toUpperCase()); // Store user input characters
        document.removeEventListener('keydown', handleKey); // Remove the event listener
        resolve();
      });
    });
  }*/
  function waitForUserInput() {
    return new Promise((resolve) => {
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.style.position = 'absolute';
      inputField.style.top="-1000px";
      inputField.style.left="-1000px";
      inputField.style.opacity = 0;
      document.body.appendChild(inputField);
      //<input type="text" id="hiddenInput" style="position: absolute; top: -1000px; left: -1000px;">
  
      inputField.addEventListener('input', function handleInput(event) {
        userInput.push(event.target.value.toUpperCase());
        inputField.removeEventListener('input', handleInput);
        document.body.removeChild(inputField);
        resolve();
      });
      inputField.focus();
    });
  }
  
  for (const element of challenge) {
    await new Promise(r => setTimeout(r, 1000));
    let char = await charToMorseArray(element);
    await flashMorseCode(char, pause, lLength, sLength);
    //console.log(char);
    await waitForUserInput();
    //console.log(userInput); // Log user input for each element

  }
  let endTime = Date.now()
  document.getElementById("container2").style.visibility = "visible"
  document.getElementById("restart").disabled = false
  document.body.style.setProperty("cursor", "initial")
    document.body.style.setProperty("caret-color", "white")
  let score = await calculateAnswer(challenge, userInput)
  let time = (endTime - startTime) / 1000
  document.getElementById("score").innerHTML = score + "/" + challengelength
  document.getElementById("time").innerHTML = time
  let buff1,buff2
  buff1=""
  buff2=""
  
  if((score/challengelength)!==1 && competitionMode===false){
  document.getElementById("difference").innerHTML=`
  <p>Expected input:</p>
  <p><span id="expected"></span></p>
  <p>Received input:</p>
  <p><span id="received"></span></p>`
  for(let i = 0; i < challenge.length; i++){
    if(challenge[i]===userInput[i]){
      buff1+=challenge[i]
      buff2+=userInput[i]
    }else{
      buff1+=`<span style='color:yellow'>${challenge[i]}</span>`
      buff2+=`<span style='color:yellow'>${userInput[i]}</span>`
    }
    if(i!==challenge.length-1){
      buff1+=","
      buff2+=","
    }
    //console.log(buff1)
    document.getElementById("expected").innerHTML=buff1
    document.getElementById("received").innerHTML=buff2
  }
  }
  if(competitionMode){
    const data = {
      "mode":mode,
      "id": id,
      "score": score,
      "total":challengelength,
      "totalTime": time,
      "expected":challenge,
      "got":userInput
    };
  
    fetch('/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
  
  
  //console.log(userInput)

}

async function calculateAnswer(array1, array2) {
  // Ensure both arrays have the same length
  if (array1.length !== array2.length) {
    throw new Error("Arrays must have the same length");
  }

  let count = 0;

  // Iterate through the arrays in parallel and compare elements at the same index
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] === array2[i]) {
      count++;
    }
  }

  return count;
}


const Code = [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0]; // Example Morse code

async function charToMorseArray(char) {
  const morseCodeMap = {
    'A': '01', 'B': '1000', 'C': '1010', 'D': '100', 'E': '0', 'F': '0010',
    'G': '110', 'H': '0000', 'I': '00', 'J': '0111', 'K': '101', 'L': '0100',
    'M': '11', 'N': '10', 'O': '111', 'P': '0110', 'Q': '1101', 'R': '010',
    'S': '000', 'T': '1', 'U': '001', 'V': '0001', 'W': '011', 'X': '1001',
    'Y': '1011', 'Z': '1100', '0': '11111', '1': '01111', '2': '00111',
    '3': '00011', '4': '00001', '5': '00000', '6': '10000', '7': '11000',
    '8': '11100', '9': '11110',
  };

  char = char.toUpperCase();

  if (char in morseCodeMap) {
    const morseString = morseCodeMap[char];
    const morseArray = Array.from(morseString).map(signal => parseInt(signal));
    return morseArray;
  } else {
    return [];
  }
}




async function flashMorseCode(code, pause, lLength, sLength) {
  let currentIndex = 0;
  const flashlight = document.getElementById('flashlight');

  function flash() {
    return new Promise((resolve) => {
      if (currentIndex < code.length) {
        if (code[currentIndex] === 1) {
          flashlight.style.boxShadow = '0 0 5px 20px rgba(196, 180, 84, 0.8)'; // Long flash
          flashlight.style.backgroundColor = 'rgb(196, 180, 84)';
          const startTime = performance.now();

          function animate() {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            if (elapsedTime < lLength) {
              requestAnimationFrame(animate); // Continue animation
            } else {
              flashlight.style.boxShadow = 'none'; // Turn off the flashlight
              flashlight.style.backgroundColor = 'rgba(0, 0, 0, 0)';
              currentIndex++;
              setTimeout(() => {
                flash().then(resolve); // Pause between long flashes (adjust as needed)
              }, pause);
            }
          }

          requestAnimationFrame(animate);
        } else {
          flashlight.style.boxShadow = '0 0 5px 20px rgba(196, 180, 84, 0.8)'; // Short flash
          flashlight.style.backgroundColor = 'rgb(196, 180, 84)';
          const startTime = performance.now();

          function animate() {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            if (elapsedTime < sLength) {
              requestAnimationFrame(animate); // Continue animation
            } else {
              flashlight.style.boxShadow = 'none'; // Turn off the flashlight
              flashlight.style.backgroundColor = 'rgba(0, 0, 0, 0)';
              currentIndex++;
              setTimeout(() => {
                flash().then(resolve); // Pause between short flashes (adjust as needed)
              }, pause);
            }
          }

          requestAnimationFrame(animate);
        }
      } else {
        resolve(); // Resolve the promise when the flashing is done
      }
    });
  }

  // Start the flashing sequence
  await flash();
}


$(document).ready(function () {
  startScreen()

});

//flashMorseCode(morse