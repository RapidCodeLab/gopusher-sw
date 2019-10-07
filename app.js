
let app = {}
app.data = {}
app.gateway = 'https://events.rapidcodelab.com/events/subscribe' //change to your eventsapp url
app.data.channel = 'gopusher-landing' //Channel
app.data.subid = 'subid_1' //SubID
app.data.publisher='OBA2aPf8SvfDYC45h5RoryYKao2FIdpNvPgAPpGpDB3ootxzf6enwB2AqmmWfXrq' //PublisherAPI
app.data.ua = navigator.userAgent || 'unknown'
app.data.page = window.location.protocol+'//'+window.location.hostname || 'unknown'
app.data.browser_lang = navigator.language || navigator.userLanguage
app.data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'

let isUCBrowser = app.data.ua.includes("UCBrowser")

let isSubscribed = false
let swRegistration = null
let applicationKey = "BPgUDhy41B692MsuEP58xGa4RCZBGVNFtPO27_iVWgX6vmMdlQBV9oXS3JRbBAdb_e0Cgvw72Wz-qXKJSjYKed8" //This is your VAPID Public Key


// Url Encription
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

// Installing service worker
if ('serviceWorker' in navigator && 'PushManager' in window && !isUCBrowser) {
    console.log('Service Worker and Push is supported')

    navigator.serviceWorker.register('/sw.js')
        .then(function (swReg) {
            console.log('service worker registered')

            swRegistration = swReg

            swRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    isSubscribed = !(subscription === null)

                    if (isSubscribed) {

                        console.log('User is subscribed')
                        
                    } else {
                        swRegistration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlB64ToUint8Array(applicationKey)
                            })
                            .then(function (subscription) {
                            
                                console.log('User is subscribed')

                                saveSubscription(subscription)

                                isSubscribed = true
                            })
                            .catch(function (err) {
                                console.log('Failed to subscribe user: ', err)
                            })
                    }
                })
        })
        .catch(function (error) {
            console.error('Service Worker Error', error)
        })
} else {
    console.warn('Push messaging is not supported')
}

function saveSubscription(subscription) {
   s = subscription.toJSON()  

   app.data.endpoint = s.endpoint
   app.data.auth = s.keys.auth
   app.data.p256dh = s.keys.p256dh

   fetch(app.gateway, {
     method: 'POST',
     cache: "no-cache",
     headers: {
         "Content-Type": "text/plain",
         'Accept': 'application/json',
     },
        body: JSON.stringify(app.data),
     }).then(response => {         
       return response.json()
     }).then(resp => {
          console.warn('Data sent success.', resp)
          firePostBackURL(resp)
     }).catch(error => {
        console.warn('Error send data.',  error)
    })
}


var clickidParamName = "cid" //for Binom  use get param with this name. sample: ?cid={clickid}

// postback url
function firePostBackURL(resp){
  
  console.warn("resp", resp)

  var clickID = findGetParam(clickidParamName)
  
  if (clickID == "" || clickID == null){
    console.warn("Empty clickid param")  
    return
  }

  var trackerURL = "https://tracker.com/folder/click.php?cnv_id="+clickID+"&payout="+resp.price

  fetch(trackerURL).then(response => {
        console.warn('Success tracker fired.', response)
    }).catch(error => {
        console.warn('Error tracker fired',  error)
    })
}


//find get param
function findGetParam(param) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === param) result = decodeURIComponent(tmp[1]);
    }
    return result;
}