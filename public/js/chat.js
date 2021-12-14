// This is the client

// DOM Elements
const chatForm = document.getElementById("chat-form");
const sendBtn = document.getElementById("chat-form-send-btn");
const messgaeInputField = document.getElementById("chat-form-message-input");
const sendlocationBtn = document.getElementById("send-location-btn");
const messageDiv = document.getElementById("messages-div");
const sidebar = document.getElementById("sidebar");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationUrlTemplate = document.getElementById(
    "location-url-template"
).innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoscroll = () => {
    const newMessage = messageDiv.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = messageDiv.offsetHeight;

    const containerHeight = messageDiv.scrollHeight;

    const scrollOffset = messageDiv.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messageDiv.scrollTop = messageDiv.scrollHeight;
    }

    console.log(messageDiv.scrollTop, messageDiv.scrollHeight);
};

const socket = io();

socket.on("message", (messageObj) => {
    const username = messageObj.username;
    const message = messageObj.text;
    const createdAt = moment(messageObj.createdAt).format("h:mm a");

    const html = Mustache.render(messageTemplate, {
        username,
        message,
        createdAt,
    });
    messageDiv.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    sendBtn.disabled = true;

    const inputMessage = messgaeInputField.value;

    if (inputMessage !== "") {
        socket.emit("sendMessage", inputMessage, (error) => {
            sendBtn.disabled = false;

            messgaeInputField.value = "";

            messgaeInputField.focus();

            if (error) {
                return console.log(error);
            }
            console.log("The message was delivered!");
        });
    } else {
        sendBtn.disabled = false;

        messgaeInputField.focus();
    }
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    sidebar.innerHTML = html;
});

socket.on("locationMessage", (locationObj) => {
    const locationUrl = locationObj.locationUrl;
    const createdAt = moment(locationObj.createdAt).format("h:mm a");
    const username = locationObj.username;

    const html = Mustache.render(locationUrlTemplate, {
        username,
        locationUrl,
        createdAt,
    });
    messageDiv.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

sendlocationBtn.addEventListener("click", (e) => {
    e.preventDefault();

    sendlocationBtn.disabled = true;

    if (!navigator.geolocation) {
        return alert("GeoLocation is not supported by your browser!");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            long: position.coords.longitude,
            lat: position.coords.latitude,
        };

        socket.emit("sendLocation", coords, () => {
            sendlocationBtn.disabled = false;
            console.log("Location shared!");
        });
    });
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
