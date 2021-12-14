// This is the server

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/users");

const {
    generateMessage,
    generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("New websocket connection!");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Chat App", "Welcome"));
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                generateMessage("Chat App", `${user.username} has joined`)
            );

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();
    });

    socket.on("sendMessage", (inputMessage, callback) => {
        const filter = new Filter();

        if (filter.isProfane(inputMessage)) {
            return callback("Profanity is not allowed");
        }

        const user = getUser(socket.id);

        io.to(user.room).emit(
            "message",
            generateMessage(user.username, inputMessage)
        );
        callback();
    });

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);

        const locationLink = `https://google.com/maps?q=${coords.lat},${coords.long}`;

        const locationObj = generateLocationMessage(
            user.username,
            locationLink
        );

        io.to(user.room).emit("locationMessage", locationObj);
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage("Chat App", `${user.username} has left!`)
            );
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, () => {
    console.log("Server is up and running on " + port);
});
