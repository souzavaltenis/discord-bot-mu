const dataNow = (): string => {
    return new Date().toLocaleDateString("pt-BR", {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"});
}

export { dataNow }