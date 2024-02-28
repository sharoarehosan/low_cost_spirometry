// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqLQGdinuxkBHv7ZC29CWYgA8WCSQ6Iok",
    authDomain: "low-cost-spirometry.firebaseapp.com",
    databaseURL: "https://low-cost-spirometry-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "low-cost-spirometry",
    storageBucket: "low-cost-spirometry.appspot.com",
    messagingSenderId: "3546429374",
    appId: "1:3546429374:web:40bd1ff4a355f84ea42bef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// getting reference to the database
var database = firebase.database();

//getting reference to the data we want
var parentRef = database.ref('test/');

function displayObjectInHTML(object1, object2, object3, name) {
    let table = document.getElementById(name);

    // Iterate over object keys and values
    for (let key in object1) {
        if (object1.hasOwnProperty(key)) {
            let row = table.insertRow();
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);
            cell1.textContent = key;
            cell2.textContent = object1[key];
            cell3.textContent = object2[key];
            cell4.textContent = object3[key];
        }
    }
}

function displayplot(object1, object2,idx,label) {
    const keys1 = Object.keys(object1);
    const values1 = Object.values(object1);
    const keys2 = Object.keys(object2);
    const values2 = Object.values(object2);

    // Create a new chart
    const ctx = document.getElementById(idx).getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: label,
          data: keys1.map((key, index) => ({ x: values1[index], y: values2[index], label: key }))
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear',
            position: 'left'
          }
        }
      }
    });
}

var voltage = {};
var fvcar = {};
//fetch the data
parentRef.on('value', function (snapshot) {
    // Fetching Data
    var parentData = snapshot.val();
    var voltage = parentData.json;
    var time = parentData.time;
    // Creating a empty object 
    var length = Object.keys(voltage).length;
    var flow = {};
    //converting voltage to flow
    for (let i = 0; i < length; i++) {
        var data = voltage[i];
        data = parseFloat(data);
        var flow_rate;
        if (data < 129) flow_rate = 0;
        else {
            //y=2.577 x - 129.8
            flow_rate = (data + 129.8) / (2.577*60);
            flow_rate = flow_rate.toFixed(2);
        }
        // console.log("Voltage:");
        // console.log(data);
        // console.log("Flowrate:");
        // console.log(flow_rate);
        flow[i] = flow_rate;
    }
    //displaying the table
    displayObjectInHTML(voltage, flow, time, 'flowtable');
    console.log(voltage);
    var fvc=0
    var fev1=0
    var ratio=0
    var pfrate=Math.max(...Object.values(flow));
    console.log(pfrate)
    // Calculating FVC
    for (let i = 0; i < (length-1); i++) {
       fvc+=flow[i]*(time[i+1]-time[i])/1000
       if(time[i]<1000) fev1=fvc
       fvcar[i]=fvc
    } 
    fvc= fvc.toFixed(2);
    fev1= fev1.toFixed(2);
    ratio=fev1*100/fvc
    ratio= ratio.toFixed(2);

    //Displaying data
    document.getElementById("pfrate").textContent =+ pfrate + "L/s";
    document.getElementById("fvc").textContent =+ fvc + "L";
    document.getElementById("fev1").textContent =+ fev1 + "L";
    document.getElementById("ratio").textContent =+ ratio + "%";

    //displaying graph
    displayplot(time,flow,'fvtime','Flowrate vs Time (ms)')
    displayplot(fvcar,flow,'fvfvc','Flowrate vs Volume')
    displayplot(time,fvcar,'fvcvtime','Volume vs Time (ms)')


    
});