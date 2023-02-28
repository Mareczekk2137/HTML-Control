
let data
async function getData(){
  let data
  await chrome.storage.sync.get().then((result) => {
    data = result
    if (!data.rules){
      data.rules = []
    }
  })
  return data
}
async function UpdateRules(item) {
  chrome.storage.sync.get().then((result) => {
    let rules = result.rules || []
    rules.push(item)
    console.log(rules)
    chrome.storage.sync.set({"rules": rules})
  });
}




chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.message === "giveData") {
    console.log("giveData")
    console.log(data)
    if (!data){
      data = await getData()
    }
    sendResponse(data)
  }else if(request.message === "updateRules"){
    UpdateRules(request.data)
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  data = await getData()
});

