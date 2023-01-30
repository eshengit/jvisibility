export function  getServerStatus(){
    return fetch("http://localhost:8080/").then((response)=> response.json())
}

export function updateProcessToProfile(processName){
    fetch("http://localhost:8080/start", {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            p: processName,
          }),
          headers: {
            'Content-Type': 'application/json'
          }
    });
}

export function getServerDeadlock(){
  return fetch("http://localhost:8080/deadlock", {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
}

export function getStatsReport(startTime){
    console.log("stats call ", startTime)
    return fetch("http://localhost:8080/stats", {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            st: startTime
          }),
          headers: {
            'Content-Type': 'application/json'
          }
    }).then((response)=> response.json());
}

export function getCPUReport(startTime, cpuType){
    console.log("cpu call ", startTime, cpuType)
    return fetch("http://localhost:8080/cpu", {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            st: startTime,
            type: cpuType
          }),
          headers: {
            'Content-Type': 'application/json'
          }
    }).then((response)=> response.json());
}