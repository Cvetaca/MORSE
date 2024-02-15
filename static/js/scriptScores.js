
function customComparator(a, b) {
  const priority = {
      Champion: 0,
      Hard: 1,
      Easy: 2,
  };
  const aPriority = priority[a[2]];
  const bPriority = priority[b[2]];
  if (aPriority !== bPriority) {
      return aPriority - bPriority;
  }

  const aScore = a[3] / a[4] * 100;
  const bScore = b[3] / b[4] * 100;

  if (aScore !== bScore) {
      return bScore - aScore;
  }
  return a[5] - b[5];
}

async function visualisation(resData) {
  resData.sort(customComparator);
  let before=""
    var displayTable=""
    let counter=1
    let varn=false
    let buffer
    resData.forEach(tableInputData => {
      if(before!=tableInputData[2] &&varn){
        displayTable += '<tr><td colspan="8"><hr></td></tr>';
        counter=1
      }
      if(counter==1){
        buffer='<i class="fas fa-medal gold"></i>'
      }else if(counter==2){
        buffer='<i class="fas fa-medal silver"></i>'
      }else if(counter==3){
        buffer='<i class="fas fa-medal bronze"></i>'
      }else{
        buffer=counter
      }
      displayTable += "<tr><td>"+buffer+"</td><td>" + tableInputData[1] + "</td><td>" + tableInputData[2] + "</td><td>" + tableInputData[3] + "</td><td>" +  tableInputData[4] +"</td><td>" + (tableInputData[3]/tableInputData[4]*100).toFixed(2)  + "</td><td>" + tableInputData[5].toFixed(2) + "</td><td>" +tableInputData[0]+"</td></tr>"
      counter++
      varn=true
      before=tableInputData[2]
    });
    return document.getElementById("tableContent").innerHTML = displayTable
  }

async function showData(){
  let roomID = "0";
  const url = window.location.href;
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  if (lastPart !== "" && lastPart != 'scores') {
    roomID = lastPart;
  }
  let data = await fetch(`/api/results/`+roomID)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
    return data
}

let dataGlobal = showData()



document.addEventListener("DOMContentLoaded", async function () {
  visualisation(await dataGlobal);
});
