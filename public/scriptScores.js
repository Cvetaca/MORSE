async function visualisation(resData) {
    var displayTable=""
    resData.forEach(tableInputData => {
      displayTable += "<tr><td>" + tableInputData[1] + "</td><td>" + tableInputData[2] + "</td><td>" + tableInputData[3] + "</td><td>" +  tableInputData[4] +"</td><td>" + (tableInputData[3]/tableInputData[4]*100).toFixed(2)  + "</td><td>" + tableInputData[5].toFixed(2) + "</td><td>" +tableInputData[0]+"</td></tr>"

    });
    return document.getElementById("tableContent").innerHTML = displayTable
  }


async function showData(){
    let data = await fetch(`/api/results`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
    //console.log(data)
    visualisation(data)
    return
}

$(document).ready(function () {
    showData()
  
  });

