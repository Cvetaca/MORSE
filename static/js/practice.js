let FREQUENCY = 440;

let note_context;
let note_node;
let gain_node;
let audioContextInitialized = false;

function initializeAudioContext() {
  note_context = new AudioContext();
  note_node = note_context.createOscillator();
  gain_node = note_context.createGain();
  note_node.frequency.value = FREQUENCY.toFixed(2);
  gain_node.gain.value = 0;
  note_node.connect(gain_node);
  gain_node.connect(note_context.destination);
  note_node.start();
  audioContextInitialized = true;
}

let mute=false;

function audioOnOff(){
  if(!mute){
    try{
      note_node.frequency.value=0;
    }catch(e){
      FREQUENCY=0;
    }
    
    document.getElementById("mute_image").src="/static/content/speaker-mute.png"
    mute=true;
  }else{
    try{
      note_node.frequency.value=FREQUENCY.toFixed(2);
    }catch(e){
      FREQUENCY=440;
    }
    document.getElementById("mute_image").src="/static/content/speaker-loud.png"
    
    mute=false;
  }
  
}


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

  async function flashMorseCode(code, pause, lLength, sLength,competitionMode) {
  
    let currentIndex = 0;
    const flashlight = document.getElementById('flashlight');
  
    function flash() {
      return new Promise((resolve) => {
        if (currentIndex < code.length) {
          if (code[currentIndex] === 1) {
            //flashlight.style.boxShadow = '0 0 5px 20px rgba(114,142,182,0.8)'; // Long flash
            //flashlight.style.background='radial-gradient(circle at 50% 50%, #fff 0%,  #aaa 20%, #555 50%,  transparent 80%);'
            flashlight.style.opacity = 1;
            if(competitionMode===false){
              document.getElementById("supportText").innerHTML += "&ndash;&nbsp;"
            }
            
            const startTime = performance.now();
            gain_node.gain.setTargetAtTime(0.1, 0, 0.001)
            function animate() {
              const currentTime = performance.now();
              const elapsedTime = currentTime - startTime;
              if (elapsedTime < lLength) {
                requestAnimationFrame(animate); // Continue animation
              } else {
                flashlight.style.opacity = 0;
                //flashlight.style.boxShadow = 'none'; // Turn off the flashlight
                //flashlight.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                gain_node.gain.setTargetAtTime(0, 0, 0.001)
                currentIndex++;
                setTimeout(() => {
                  flash().then(resolve); // Pause between long flashes (adjust as needed)
                }, pause);
              }
            }
  
            requestAnimationFrame(animate);
          } else {
            //flashlight.style.boxShadow = '0 0 5px 20px rgba(114,142,182,0.8)'; // Short flash
            ///flashlight.style.backgroundColor = 'rgba(114,142,182,0.95)';
            flashlight.style.opacity = 1;
            if(competitionMode===false){
              document.getElementById("supportText").innerHTML += "&centerdot;&nbsp;"
            }
            const startTime = performance.now();
            gain_node.gain.setTargetAtTime(0.1, 0, 0.001)
            //playBeep(sLength / 100);
            function animate() {
              const currentTime = performance.now();
              const elapsedTime = currentTime - startTime;
              if (elapsedTime < sLength) {
                requestAnimationFrame(animate); // Continue animation
              } else {
                //flashlight.style.boxShadow = 'none'; // Turn off the flashlight
                //flashlight.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                flashlight.style.opacity = 0;
                
                gain_node.gain.setTargetAtTime(0, 0, 0.001)
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

  function generateChallenge(challengelength, characters) {
    //const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    challenge = [];
  
    for (let i = 0; i < challengelength; i++) {
      const randomCharacter = rando(characters);
      challenge.push(randomCharacter.value.toUpperCase());
    }
  
    return challenge
  }

let practiceLevelSelector={
    0:['e','i','s','h'],
    1:['t','m','o'],
    2:['a','u','v'],
    3:['n','d','b'],
    4:['p','r'],
    5:['x','k'],
    6:['g','w'],
    7:['l','f'],
    8:['y','q'],
    9:['j','z','c'],
    10:['1','2','3','4','5'],
    11:['6','7','8','9','0'],
    12:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0'],
    13:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0'],
    14:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0']
}


async function startGame(level,challengelength,levelSelect) {
    //console.log(competitionMode)
    //console.log(id, level)
    var counter = 3;
    console.log(level,challengelength,levelSelect)
    document.getElementById("swrapper").style.opacity = 0
    document.getElementById("swrapper").style.visibility = "hidden"
    document.getElementById("flashlight").style.visibility = "visible"
    document.getElementById("scrollLeftButton").style.visibility = "hidden"
    document.getElementById("scrollRightButton").style.visibility = "hidden"
    var timer = setInterval(function () {
  
      $('#countdown').remove();
  
      var countdown = $('<span id="countdown">' + (counter == 0 ? '' : counter) + '</span>');
      countdown.appendTo($('body'));
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
    let pause, lLength, sLength,mode,intLevel
    switch (level) {
      case "0":
        intLevel=0
        mode="Easy"
        pause = 250
        lLength = 600
        sLength = 200
        break;
      case "1":
        intLevel=1
        mode="Hard"
        pause = 110
        lLength = 340
        sLength = 110
        break;
  
      case "2":
        intLevel=2
        mode="Champion"
        pause = 80
        lLength = 210
        sLength = 60
        break;
    }
    let challenge = await generateChallenge(challengelength,practiceLevelSelector[levelSelect])
    initializeAudioContext()
    await new Promise(r => setTimeout(r, 3000));
    let userInput = []
    let startTime = Date.now()
  
    function waitForUserInput() {
      return new Promise((resolve) => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.style.position = 'absolute';
        inputField.style.top = "-1000px";
        inputField.style.left = "-1000px";
        inputField.style.opacity = 0;
        document.body.appendChild(inputField);
  
        const handleInput = (event) => {
          userInput.push(event.target.value.toUpperCase());
          inputField.removeEventListener('input', handleInput);
          inputField.removeEventListener('blur', handleFocus);
          inputField.removeEventListener('touchstart', handleFocus);
          document.body.removeChild(inputField);
          resolve();
        };
  
        const handleFocus = () => {
          inputField.focus();
        };
  
        inputField.addEventListener('input', handleInput);
        inputField.addEventListener('blur', handleFocus);
        inputField.addEventListener('touchstart', handleFocus);
        inputField.focus();
      });
    }
    
    for (const element of challenge) {
      await new Promise(r => setTimeout(r, 1000));
      let char = await charToMorseArray(element);
      await flashMorseCode(char, pause, lLength, sLength,false);
      //console.log(char);
      await waitForUserInput();
      document.getElementById("supportText").innerHTML=""
      //console.log(userInput); // Log user input for each element
  
    }
    let endTime = Date.now()
    document.getElementById("container2").style.visibility = "visible"
    document.getElementById("container2").style.opacity = 1
    document.getElementById("container2").style.pointerEvents = "auto"
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
    var progress=JSON.parse(localStorage.getItem("progress"))
    if (progress[`L${levelSelect+1}`].score<=score){
      progress[`L${levelSelect+1}`].score=score
      progress[`L${levelSelect+1}`].time=time
    }
    if(score===challengelength && time<60){
      progress[`L${levelSelect+2}`].enable=true
    }
    localStorage.setItem("progress", JSON.stringify(progress));
    if((score/challengelength)!==1){
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
  }
const template={
  "L1": {
      "enable": true,
      "score": 0,
      "time": 0.00
  },
  "L2": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L3": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L4": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L5": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L6": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L7": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L8": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L9": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L10": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L11": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L12": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L13": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L14": {
      "enable": false,
      "score": 0,
      "time": 0.00
  },
  "L15": {
      "enable": false,
      "score": 0,
      "time": 0.00
  }
}
  document.addEventListener("DOMContentLoaded", async function () {
    if (!localStorage.getItem("progress")) {
      localStorage.setItem("progress", JSON.stringify(template));
      const card = cards[0];
      card.scrollIntoView({ behavior: 'smooth', inline: 'center' ,block: 'center'});
      console.log("Progress initialized")
    }else{
      var progress=JSON.parse(localStorage.getItem("progress"))
      var lastEnabledLevel = Object.keys(progress).findLastIndex(key => progress[key].enable === true);
      if (lastEnabledLevel === -1) {
        lastEnabledLevel = 0;
      }
      transferDataFromJsonToWindow(progress)
      scrollToCard(lastEnabledLevel+1)
      console.log("Progress loaded")
    }
  });

  /*var start = null;
  window.addEventListener("touchstart",function(event){
    if(event.touches.length === 1){
       //just one finger touched
       start = event.touches.item(0).clientX;
     }else{
       //a second finger hit the screen, abort the touch
       start = null;
     }
   });
   window.addEventListener("touchend",function(event){
    var offset = 100;//at least 100px are a swipe
    if(start){
      //the only finger that hit the screen left it
      var end = event.changedTouches.item(0).clientX;

      if(end > start + offset){
        scrollToLeft()
      }
      if(end < start - offset ){
       scrollToRight()
      }
    }
  });*/

  function transferDataFromJsonToWindow(jsonData) {
    const levels = Object.keys(jsonData);
    
    levels.forEach(level => {
      const levelId = level.slice(1);
      const scoreId = `L${levelId}`;
      const timeId = `L${levelId}T`;
      const picture1 = `P${levelId}`;
      const picture2 = `P${levelId}T`;
      if (jsonData[level].enable) {
        const scoreElement = document.getElementById(scoreId);
        const timeElement = document.getElementById(timeId);
        const card = document.getElementById(`lvl${levelId}`);
        const pictureElement1 = document.getElementById(picture1);
        const pictureElement2 = document.getElementById(picture2);
        if (jsonData[level].score===20) pictureElement1.src = "/static/content/check.png";
        if (jsonData[level].time<60 && jsonData[level].time != 0.00) pictureElement2.src = "/static/content/check.png";
        
        scoreElement.textContent = jsonData[level].score;
        timeElement.textContent = jsonData[level].time.toFixed(2);
        
        
       card.classList.remove('disabledCard');
      }
      return
    });
  }
