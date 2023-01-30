
export const backendHost = "localhost"
export const backendPort = "8080"
export const url = "http://" + backendHost + ":" + backendPort + "/"

export function  getServerStatus(){
    console.log("url:",url)
    return fetch(url).then((response)=> response.json())
}

export function updateProcessToProfile(processName){
    console.log("process:",url)
    fetch(url + "start", {
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
  return fetch(url + "deadlock", {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
}

export function getStatsReport(startTime){
    console.log("stats call ", startTime)
    return fetch(url + "stats", {
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
    return fetch(url + "cpu", {
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