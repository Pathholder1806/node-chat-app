const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: "Username & room are required",
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate username
    if (existingUser) {
        return {
            error: "Username is already in use",
        };
    }

    // Store User
    const user = {
        id,
        username,
        room,
    };
    users.push(user);
    return { user };
};

// removeUser
const removeUser = (id) => {
    // Index of user to be deleted
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        // Found a match
        return users.splice(index, 1)[0];
    }
};

// getUser
const getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    });
};

// getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();

    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });

    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
