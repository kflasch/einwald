function extendObj(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
}

function getRandomItem(array) {
    if (!array.length)
        return null;
    return array[Math.floor(ROT.RNG.getUniform() * array.length)];
}
