
let app = {}
app.data = {}
app.gateway = 'https://events.rapidcodelab.com/events/subscribe' //change to your eventsapp url
app.data.channel = 'gopusher-landing' //Channel
app.data.publisher='OBA2aPf8SvfDYC45h5RoryYKao2FIdpNvPgAPpGpDB3ootxzf6enwB2AqmmWfXrq' //PublisherAPI
app.data.ua = navigator.userAgent || 'unknown'
app.data.page = window.location.href || 'unknown'
app.data.browser_lang = navigator.language || navigator.userLanguage
app.data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'


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
if ('serviceWorker' in navigator && 'PushManager' in window) {
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
     mode: "no-cors",
     cache: "no-cache",
     headers: {
         "Content-Type": "application/json charset=utf-8",
     },
        body: JSON.stringify(app.data),
     }).then(response => {
         console.warn('Data sent success.', response)
     }).catch(error => {
        console.warn('Error send data.', data, error)
    })
}

