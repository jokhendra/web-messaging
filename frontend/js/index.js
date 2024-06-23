// app.js
// const userId = prompt('Enter your user ID:', '12345');

// getusername from url

let url = new URL(window.location.href);
let username = url.searchParams.get("username");
var leftContainer = document.querySelector('.left-container');
var arrowButton = document.querySelector('.arrow-button');
let userId = null;
let touserId = null;
let tousername = null;
let callerId = null;
let callReceiverId = null;
let isCaller = false;
let isCallruning = false;
let callBoxduration = null;
let lastMessage = "";
let  callingTone = document.getElementById('callingtone');
let  ringTone = document.getElementById('ringtone');

const socket = io('http://192.168.1.104:4000/socket',{
    query: {
      username
    }
});
let users = [];

// stun server

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    }
  ]
};


const callTimeCounter = document.getElementById('time-counter');

// Function to update the time
let hours = 0;
let minutes = 0;
let seconds = 0;

let callTimeInterval = null;
// Function to update the call time counter
function updateCallTime() {
    // Increment seconds
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }

    // Format the time values
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Update the call time counter in the HTML
    callTimeCounter.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Update the call time counter every second

function toggleLeftContainer() {
  
  if (leftContainer.style.left === '-100%') {
      leftContainer.style.left = '0';
      arrowButton.textContent = '◀'; // Change arrow direction to left
  } else {
      leftContainer.style.left = '-100%';
      arrowButton.textContent = '▶'; // Change arrow direction to right
  }
}

socket.on('your-id', (id) => {
  userId = id;
});

function remove_pending_messages(id){
  let span = document.getElementById(`pending-messages-${id}`);
  if(span){
    span.textContent = "";
    span.className = "";
  }

}

function readytomessage(userid,username){
  document.getElementById('right-container').style.display = 'block';
  touserId = userid;
  tousername = username;
  // update to to user side
  leftContainer.style.left = '-100%';
  arrowButton.textContent = '▶'; 

  socket.emit("update-to-user",{from:userid,to:userId,username})
  document.getElementById('chat-display-name').innerText = username;

  // remove pending message

  remove_pending_messages(userid);
}

socket.on('update-to-user',(user_id)=>{
  socket.emit('get-old-messages',{from:userId,to:user_id});
  // touserId = user_id;
})

socket.on('get-old-messages',(messages)=>{
  let chat_box = document.getElementById('chat-messages');
  chat_box.innerHTML = "";
  if(messages.length==0)return;
  messages.forEach((ele,index)=>{
    if(ele.from == userId){
      let div = document.createElement('div');
      div.className = 'right-message';
      let rightChild = document.createElement("div");
      rightChild.className = 'right-child';
      let msg = document.createElement("p");
      msg.textContent = ele.message;
      let confirmTime = document.createElement("div");
      confirmTime.className = 'confirm-time';
      let time = document.createElement("span");
      time.classList.add('time')
      const date = new Date(ele.timeStamp);
      const options = { hour: 'numeric', minute: 'numeric', hour12: true };
      const localTime = date.toLocaleTimeString('en-US', options);
      time.textContent = localTime;
      const doubleTick = document.createElement('div');
      doubleTick.classList.add('double-tick-sent');
      if(ele.delivered && !ele.read){
        const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg1.setAttribute('viewBox', '0 0 24 24');
        svg1.classList.add('tick');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M1 13.5l4 4L13 9');
        svg1.appendChild(path1);
        doubleTick.appendChild(svg1);
        // Create and append second SVG tick
        const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg2.setAttribute('viewBox', '0 0 24 24');
        svg2.classList.add('tick');
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M1 13.5l4 4L13 9');
        svg2.appendChild(path2);
        doubleTick.appendChild(svg2);
      }
      else if(ele.read){
        // Create and append first SVG tick
        console.log("this is inside the if else statement");
        const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg1.setAttribute('viewBox', '0 0 24 24');
        svg1.classList.add('tick');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M1 13.5l4 4L13 9');
        svg1.appendChild(path1);
        doubleTick.appendChild(svg1);
        // Create and append second SVG tick
        const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg2.setAttribute('viewBox', '0 0 24 24');
        svg2.classList.add('tick');
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M1 13.5l4 4L13 9');
        svg2.appendChild(path2);
        doubleTick.appendChild(svg2);
        doubleTick.classList.remove('double-tick-sent');
        doubleTick.classList.add('double-tick-read');

      }else{
        console.log("this is inside the else statement");
        const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg1.setAttribute('viewBox', '0 0 24 24');
        svg1.classList.add('tick');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M1 13.5l4 4L13 9');
        svg1.appendChild(path1);
        doubleTick.appendChild(svg1);
      }
      confirmTime.appendChild(time);
      confirmTime.appendChild(doubleTick);
      rightChild.appendChild(msg);
      rightChild.appendChild(confirmTime);
      div.appendChild(rightChild);
      document.getElementById('chat-messages').appendChild(div);
    }else{
      let div = document.createElement('div');
      div.classList.add('left-message');
      let leftChild = document.createElement("div");
      leftChild.classList.add('left-child');
      let msg = document.createElement("p");
      msg.textContent = ele.message;
      let confirmTime = document.createElement("div");
      confirmTime.className = 'confirm-time';
      let time = document.createElement("span");
      time.classList.add('time')
      const date = new Date(ele.timeStamp);
      const options = { hour: 'numeric', minute: 'numeric', hour12: true };
      const localTime = date.toLocaleTimeString('en-US', options);
      time.textContent = localTime;
      confirmTime.appendChild(time);
      leftChild.appendChild(msg);
      leftChild.appendChild(confirmTime);
      div.appendChild(leftChild);
      document.getElementById('chat-messages').appendChild(div);
    }
  })
})



// TODO: Show when user is typing

document.getElementById('message').addEventListener('input', () => {
  socket.emit('typing', { from: userId, to: touserId });
});

// Listen for typing events
let typingTime;
socket.on('typing', ({ from }) => {
  if (from === touserId) {
    clearTimeout(typingTime);
    document.getElementById('current-status').innerText = 'Typing...';
    // document.getElementById('current-status').style.color = 'green';
    typingTime = setTimeout(() => {
      document.getElementById('current-status').innerText = 'online';
      // document.getElementById('current-status').style.color = 'black';
    }, 1000);
  }else{
    // find the user and update the last message to Typing...
    clearTimeout(typingTime);
    let temp = document.getElementById(`last-msg-${from}`);
    if(temp){
      temp.textContent = 'Typing...';
      temp.style.color = 'green';
      typingTime = setTimeout(()=>{
        temp.textContent = lastMessage;
        temp.style.color = 'white';
      },500);
    }
  }
});



socket.on("connected-users",(users_info) => {
  users_info.forEach(user => {
    if(users.find(user => user.userId === user.userId)){
      let div = document.getElementById(user.userId);
      if(div) div.remove();
      users = users.filter(user => user.userId !== user.userId);
    }
    let mainDiv = document.createElement('div');
    mainDiv.className = 'user-info';
    mainDiv.onclick = () => {
      readytomessage(user.userId,user.username);
    };
    mainDiv.id = user.userId;
    // Main div child elements
    let userDetails = document.createElement('div');
    userDetails.className = 'user-details';
    let pendingMsgTime = document.createElement('div');
    pendingMsgTime.className = 'pending-msg-count-and-time';

    //user details div child elements
    let img = document.createElement('img');
    img.src = './imags/person.avif';
    let nameLastMsg = document.createElement('div');
    nameLastMsg.className = 'name-last-msg';

    // pending message time div child elements
    let lastMsgTime = document.createElement('span');
    lastMsgTime.className = 'last-msg-time';
    lastMsgTime.textContent = '12:00 PM';
    lastMsgTime.id = `last-msg-time-${user.userId}`;
    let pendingMsg = document.createElement('span');
    // pendingMsg.className = 'pending-msg';
    pendingMsg.id = `pending-messages-${user.userId}`;

    //nameLastMsg child elements
    let username = document.createElement('span');
    username.className = 'username';
    username.textContent = user.username;
    let lastMsg = document.createElement('span');
    lastMsg.className = 'last-msg';
    lastMsg.id = `last-msg-${user.userId}`;
    // lastMsg.textContent = '';

    // append all child elements to their parent elements
    nameLastMsg.appendChild(username);
    nameLastMsg.appendChild(lastMsg);
    userDetails.appendChild(img);
    userDetails.appendChild(nameLastMsg);
    pendingMsgTime.appendChild(lastMsgTime);
    pendingMsgTime.appendChild(pendingMsg);
    mainDiv.appendChild(userDetails);
    mainDiv.appendChild(pendingMsgTime);
    document.getElementById('online-users').appendChild(mainDiv);
    users.push(user);
  });
})



socket.on("user-connected", (user) => {
  if(users.find(user => user.userId === user.userId)){
    let div = document.getElementById(user.userId);
    if(div) div.remove();
    users = users.filter(user => user.userId !== user.userId);
  }
  let mainDiv = document.createElement('div');
  mainDiv.className = 'user-info';
  mainDiv.onclick = () => {
    readytomessage(user.userId,user.username);
  };
  mainDiv.id = user.userId;
  // Main div child elements
  let userDetails = document.createElement('div');
  userDetails.className = 'user-details';
  let pendingMsgTime = document.createElement('div');
  pendingMsgTime.className = 'pending-msg-count-and-time';

  //user details div child elements
  let img = document.createElement('img');
  img.src = './imags/person.avif';
  let nameLastMsg = document.createElement('div');
  nameLastMsg.className = 'name-last-msg';

  // pending message time div child elements
  let lastMsgTime = document.createElement('span');
  lastMsgTime.className = 'last-msg-time';
  lastMsgTime.textContent = '12:00 PM';
  lastMsgTime.id = `last-msg-time-${user.userId}`;
  let pendingMsg = document.createElement('span');
  // pendingMsg.className = 'pending-msg';
  pendingMsg.id = `pending-messages-${user.userId}`;

  //nameLastMsg child elements
  let username = document.createElement('span');
  username.className = 'username';
  username.textContent = user.username;
  let lastMsg = document.createElement('span');
  lastMsg.className = 'last-msg';
  lastMsg.id = `last-msg-${user.userId}`;
  // lastMsg.textContent = 'Hello';

  // append all child elements to their parent elements
  nameLastMsg.appendChild(username);
  nameLastMsg.appendChild(lastMsg);
  userDetails.appendChild(img);
  userDetails.appendChild(nameLastMsg);
  pendingMsgTime.appendChild(lastMsgTime);
  pendingMsgTime.appendChild(pendingMsg);
  mainDiv.appendChild(userDetails);
  mainDiv.appendChild(pendingMsgTime);
  document.getElementById('online-users').appendChild(mainDiv);
  users.push(user);

});

socket.on('user-disconnected', (user) => {
  let div = document.getElementById(user);
  div.remove();
  users = users.filter(user => user.userId !== user);
  // if(user === touserId){
  //   document.getElementById('current-status').innerText = "offline";
  //   setTimeout(()=>{
  //     document.getElementById('right-container').style.display = 'none';
  //   },2000);
  // }
});

document.addEventListener("DOMContentLoaded", function() {
  // Get input element
  var input = document.getElementById("message");
  // Add event listener for key press
  input.addEventListener("keypress", function(event) {
      // Check if the pressed key is "Enter" key
      if (event.keyCode === 13) {
          // Call send_message function
          send_message();
      }
  });
});

function scrollToBottom() {
  var chatMessages = document.getElementById("chat-messages");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Scroll to bottom on page load
scrollToBottom();

// Event listener for receiving messages
socket.on("update-message-status",({from,to,message,delivered,read,timeStamp,msgId}) => {
  if(delivered){
    let ele = document.getElementById(`double-tick-${msgId}`);
    const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg1.setAttribute('viewBox', '0 0 24 24');
    svg1.classList.add('tick');
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M1 13.5l4 4L13 9');
    svg1.appendChild(path1);
    ele.appendChild(svg1);
  }
  if(read){
    let ele = document.getElementById(`double-tick-${msgId}`);
    ele.classList.remove('double-tick-sent');
    ele.classList.add('double-tick-read');
    // ele.appendChild(svg2);
  }
});

socket.on("confirm-read",(data)=>{
  let ele = document.getElementById(`double-tick-${data.msgId}`);
  ele.classList.remove('double-tick-sent');
  ele.classList.add('double-tick-read');
})

socket.on('message', ({message,from,to,read,timeStamp,msgId}) => {
  if(from != touserId){
    let span = document.getElementById(`pending-messages-${from}`);
    span.textContent = Number(span.textContent)+1;
    span.className = 'pending-msg-count';
    document.getElementById(`last-msg-${from}`).textContent = message;
    const date = new Date(timeStamp);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const localTime = date.toLocaleTimeString('en-US', options);
    document.getElementById(`last-msg-time-${from}`).textContent = localTime;
    lastMessage = message;
    socket.emit('update-message-status',{from,to,message,delivered:true,read:false,timeStamp,msgId});
    return;
  } 
  const date = new Date(timeStamp);
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  const localTime = date.toLocaleTimeString('en-US', options);
  let div = document.createElement('div');
  div.classList.add('left-message');
  let leftChild = document.createElement("div");
  leftChild.classList.add('left-child');
  let msg = document.createElement("p");
  msg.textContent = message;
  let confirmTime = document.createElement("div");
  confirmTime.className = 'confirm-time';
  let time = document.createElement("span");
  time.classList.add('time')
  time.textContent = localTime;
  confirmTime.appendChild(time);
  leftChild.appendChild(msg);
  leftChild.appendChild(confirmTime);
  div.appendChild(leftChild);
  document.getElementById('chat-messages').appendChild(div);
  document.getElementById(`last-msg-${from}`).textContent = message;
  document.getElementById(`last-msg-time-${from}`).textContent = localTime;
  scrollToBottom();
  // send confirm delivery message
  socket.emit('update-message-status',{from,to,message,delivered:true,read:true,timeStamp,msgId});
});


async function send_message_to_server(message,msgId) {
  socket.emit('message', {message,to:touserId,from:userId,read:false,delivered:false,isServerReceived:false,msgId},(msgId)=>{
    document.getElementById(`double-tick-${msgId}`).classList.add('double-tick-sent');
  });
}
//FIXME:
async function send_message() {
  let message = document.getElementById('message').value.trim();
  if (message === '') {
    return;
  }
  const date = new Date();
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  const localTime = date.toLocaleTimeString('en-US', options);
  let msgId = Math.floor(Math.random() * 1000000);
  let div = document.createElement('div');
  div.className = 'right-message';
  let rightChild = document.createElement("div");
  rightChild.className = 'right-child';
  let msg = document.createElement("p");
  msg.textContent = message;
  let confirmTime = document.createElement("div");
  confirmTime.className = 'confirm-time';
  let time = document.createElement("span");
  time.classList.add('time')
  time.textContent = localTime;
  const doubleTick = document.createElement('div');
  doubleTick.classList.add('double-tick');
  // doubleTick.classList.add('double-tick-sent')
  doubleTick.id = `double-tick-${msgId}`;
  // Create and append first SVG tick


  // const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // svg1.setAttribute('viewBox', '0 0 24 24');
  // svg1.classList.add('tick');
  // const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  // path1.setAttribute('d', 'M1 13.5l4 4L13 9');
  // svg1.appendChild(path1);
  // doubleTick.appendChild(svg1);


  // Create and append second SVG tick
  const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg2.setAttribute('viewBox', '0 0 24 24');
  svg2.classList.add('tick');
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('d', 'M1 13.5l4 4L13 9');
  svg2.appendChild(path2);
  doubleTick.appendChild(svg2);

  confirmTime.appendChild(time);
  confirmTime.appendChild(doubleTick);
  rightChild.appendChild(msg);
  rightChild.appendChild(confirmTime);
  div.appendChild(rightChild);
  document.getElementById('chat-messages').appendChild(div);
  document.getElementById('message').value = '';
  // update the last message and time
  document.getElementById(`last-msg-${touserId}`).textContent = message;
  document.getElementById(`last-msg-time-${touserId}`).textContent = localTime;
  scrollToBottom();
  lastMessage = message;
  send_message_to_server(message,msgId);
}


const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');

let peerConnection;

function initializePeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  // Add event listeners for incoming tracks and ICE candidates
  peerConnection.ontrack = handleTrackEvent;
  peerConnection.onicecandidate = handleIceCandidateEvent;

  // Configure audio processing
  const audioStream = peerConnection.addTransceiver('audio').receiver.track;
  const audioStreamSettings = audioStream.getSettings();

  // Enable echo cancellation
  audioStreamSettings.echoCancellation = true;

  // Enable noise suppression
  audioStreamSettings.noiseSuppression = true;

  // Enable automatic gain control
  audioStreamSettings.autoGainControl = true;

  // Apply high-pass filter
  audioStreamSettings.highpassFilter = true;
}

// Function to handle incoming tracks
function handleTrackEvent(event) {
  remoteAudio.srcObject = event.streams[0];
}

// Function to handle ICE candidates
function handleIceCandidateEvent(event) {
  if (event.candidate) {
    let targetId = isCaller ? callReceiverId : callerId;
    socket.emit('ice-candidate', { candidate: event.candidate, to: targetId });
  }
}



async function startCall() {
  try {
      // Initialize peerConnection if it's not already initialized
      if (!peerConnection) {
          initializePeerConnection();
      }

      // Get local audio stream
      const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      
      // Set local audio stream to local audio element
      localAudio.srcObject = localStream;

      // Add local audio track to the peer connection
      localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
      });

      // Create and set local description (offer)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer to the other peer
      let targetId = isCaller ? callReceiverId : callerId;
      socket.emit('offer', { offer, to: targetId });
  } catch (error) {
      console.error('Error starting call:', error);
  }
}

function makeAudioCall() {
  callerId = userId;
  callReceiverId = touserId;
  isCaller = true;
  // console.log(touserId,userId);
  callingTone.currentTime = 0;
  callingTone.play();
  document.getElementById('call-user-name').innerText = `calling to ${tousername.toLowerCase()} . . .`;
  document.getElementById('audio-call-accept').style.display = 'none';
  document.getElementById('audio-call-reject').style.display = 'none';
  document.getElementById('audio-mute-unmute').style.display = 'none';
  document.getElementById('audio-call-end').style.display = "inline-block";
  document.getElementById('audioCall').style.display = "block";
  socket.emit('audio-call',{to:touserId,from:userId,username});

  callBoxduration = setTimeout(()=>{
    callingTone.pause();
    document.getElementById('call-user-name').innerText = ``;
    document.getElementById('audio-call-accept').style.display = 'none';
    document.getElementById('audio-call-reject').style.display = 'none';
    document.getElementById('audio-mute-unmute').style.display = 'none';
    document.getElementById('audio-call-end').style.display = "none";
    document.getElementById('audioCall').style.display = "none";
  },20000);
}


function acceptCall() {
  ringTone.pause();
  startCall();
  isCallruning = true;
  socket.emit('call-accepted',{from:callerId,status:true});
  document.getElementById('audio-call-accept').style.display = 'none';
  document.getElementById('audio-call-reject').style.display = 'none';
  document.getElementById('audio-mute-unmute').style.display = 'inline-block';
  document.getElementById('audio-call-end').style.display = "inline-block";
  document.getElementById('call-user-name').innerText = `${tousername}`;
  callTimeCounter.style.display = "inline-block";
  callTimeInterval = setInterval(updateCallTime, 1000);
  clearTimeout(callBoxduration);
  // document.getElementById('audioCall').style.display = 'block';
}

function rejectCall() {
  // console.log("call rejecte by",userId,touserId);
  ringTone.pause();
  socket.emit('reject-call',{from:userId,to:callerId,username:tousername});
  document.getElementById('audio-call-accept').style.display = 'none';
  document.getElementById('audio-call-reject').style.display = 'none';
  document.getElementById('audio-mute-unmute').style.display = 'none';
  document.getElementById('audio-call-end').style.display = "none";
  document.getElementById('call-user-name').innerText = ``;
  callTimeCounter.style.display = "none";
  document.getElementById('audioCall').style.display = 'none';
}

socket.on('reject-call',({})=>{
  document.getElementById('call-user-name').innerText = `call rejected by ${tousername.toLowerCase()}`;
  callingTone.pause();
  setTimeout(()=>{
    document.getElementById('audio-call-accept').style.display = 'none';
    document.getElementById('audio-call-reject').style.display = 'none';
    document.getElementById('audio-mute-unmute').style.display = 'none';
    document.getElementById('audio-call-end').style.display = "none";
    callTimeCounter.style.display = "none";
    document.getElementById('audioCall').style.display = 'none';
  },2000);
})

function endCall() {
  // Close peer connection
  if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
  }
  localAudio.srcObject = null;
  remoteAudio.srcObject = null;

  socket.emit('end-call',{from:userId,to:isCaller?callReceiverId:callerId});

  callingTone.pause();
  ringTone.pause();

  document.getElementById('audio-call-end').style.display = "none";
  document.getElementById('audioCall').style.display = "none";
  document.getElementById('call-user-name').innerText = ``;
  document.getElementById('audio-call-accept').style.display = 'none';
  document.getElementById('audio-call-reject').style.display = 'none';
  document.getElementById('audio-mute-unmute').style.display = 'none';
  document.getElementById('audio-call-end').style.display = "none";
  callTimeCounter.style.display = "none";
  clearInterval(callTimeInterval);
  hours = 0;
  minutes = 0;
  seconds = 0;
}

socket.on('end-call',({})=>{
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  localAudio.srcObject = null;
  remoteAudio.srcObject = null;
  document.getElementById('call-user-name').innerText = `call ended`;
  clearInterval(callTimeInterval);
  callTimeCounter.style.display = "none";
  ringTone.pause();
  setTimeout(()=>{
    document.getElementById('audio-call-end').style.display = "none";
    document.getElementById('audioCall').style.display = "none";
    document.getElementById('audio-call-accept').style.display = 'none';
    document.getElementById('audio-call-reject').style.display = 'none';
    document.getElementById('audio-mute-unmute').style.display = 'none';
    document.getElementById('audio-call-end').style.display = "none";
    hours = 0;
    minutes = 0;
    seconds = 0;
  },2000);
})

// mute and unmute audio

function mute_unmute() {
  // Get the local audio stream
  const localStream = localAudio.srcObject;

  // Toggle the enabled state of the audio track
  const audioTrack = localStream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;

  // Update the icon and text based on the enabled state
  const muteUnmuteIcon = document.getElementById('mute-unmute');
  if (audioTrack.enabled) {
      muteUnmuteIcon.classList.remove('fa-microphone-slash');
      muteUnmuteIcon.classList.add('fa-microphone');
      muteUnmuteIcon.title = "Mute";
  } else {
      muteUnmuteIcon.classList.remove('fa-microphone');
      muteUnmuteIcon.classList.add('fa-microphone-slash');
      muteUnmuteIcon.title = "Unmute";
  }
} 

socket.on('audio-call',({from,username})=>{
  callerId = from;
  callReceiverId = userId;
  isCaller = false;
  tousername = username;
  ringTone.currentTime = 0;
  ringTone.play();
  document.getElementById('call-user-name').innerText = `${username} is calling you`;
  document.getElementById('audio-call-accept').style.display = 'inline-block';
  document.getElementById('audio-call-reject').style.display = 'inline-block';
  document.getElementById('audio-mute-unmute').style.display = 'none';
  document.getElementById('audio-call-end').style.display = "none";
  document.getElementById('audioCall').style.display = 'block';

  callBoxduration = setTimeout(()=>{
    ringTone.pause();
    document.getElementById('call-user-name').innerText = ``;
    document.getElementById('audio-call-accept').style.display = 'none';
    document.getElementById('audio-call-reject').style.display = 'none';
    document.getElementById('audio-mute-unmute').style.display = 'none';
    document.getElementById('audio-call-end').style.display = "none";
    document.getElementById('audioCall').style.display = 'none';
  },20000)
})

socket.on('call-accepted',(status)=>{
  if(status){
    callingTone.pause();
    startCall();  
    isCallruning = true;
    document.getElementById('audio-call-accept').style.display = 'none';
    document.getElementById('audio-call-reject').style.display = 'none';
    document.getElementById('call-user-name').innerText = `${tousername.toLowerCase()}`;
    document.getElementById('audio-mute-unmute').style.display = 'inline-block';
    callTimeCounter.style.display = "inline-block";
    callTimeInterval = setInterval(updateCallTime, 1000);
    clearTimeout(callBoxduration);
  }
})

// Event listeners for signaling messages
socket.on('offer', async (offer) => {
  try {
      // Ensure peerConnection is properly initialized
      if (!peerConnection) {
          // console.error('Peer connection is not initialized.');
          // initializePeerConnection();
          return;
      }

      // Set remote description
      await peerConnection.setRemoteDescription(offer);
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      
      // Set local description
      await peerConnection.setLocalDescription(answer);
      
      // Send answer to the other peer
      let targetId = isCaller ? callReceiverId : callerId;
      socket.emit('answer', { answer, to: targetId });
  } catch (error) {
      console.error('Error handling offer:', error);
  }
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(answer);
});

socket.on('ice-candidate', async (candidate) => {
    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
});



socket.on("user-info", (data) => {
  let div = document.createElement('div');
  // add class to div
  div.className = 'user-info';
  let img = document.createElement('img');
  img.src = './imags/person.avif';
  div.appendChild(img);
  let p = document.createElement('p');
  p.textContent = data.username;
  div.appendChild(p);
  document.getElementById('online-users').appendChild(div);
});
