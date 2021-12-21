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

const generateRoomCode = (existingGames: Set<string>) => {
    for (let i = 0; i < 10; i++){
        let code = generateCode();
        if (!existingGames.has(code)){
            return code;
        }
    }
    return false;
}

const generateCode = () => {    
    let code = "";
    for (let i = 0; i < 3; i++){
        code += words[Math.floor(Math.random() * words.length)];
    }
    return code;
}

export default generateRoomCode;
