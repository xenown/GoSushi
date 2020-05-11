const words = Object.freeze([
    "Sushi",
    "Squid",
    "Fish",
    "Chopstick",
    "Tea",
    "Eat",
    "Yum",
    "Food",
    "Nori",
    "Rice",
    "Meat"
]);

const generateRoomCode = (existingGames) => {
    for (let i = 0; i < 10; i++){
        let code = generateCode(existingGames);
        if (!existingGames.has(code)){
            return code;
        }
    }
    return false;
}

const generateCode = (existingGames) => {    
    let code = "";
    for (i = 0; i < 3; i++){
        code += words[Math.floor(Math.random() * words.length)];
    }
    return code;
}

module.exports = generateRoomCode;

