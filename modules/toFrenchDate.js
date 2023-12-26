const toFrenchDate = (date) => {
    return date.setHours(date.getHours() + 1)
}

module.exports = toFrenchDate