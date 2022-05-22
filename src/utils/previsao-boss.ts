import moment from "moment";

const previsaoBoss = (horario: string): string => {
    if (!horario || !(/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/).test(horario)) return '';

    const maskHorario: string = 'HH:mm';

    const horarioNascimentoBossInicio = moment(horario, maskHorario).add(8, 'hours').format(maskHorario);
    const horarioNascimentoBossFim = moment(horario, maskHorario).add(12, 'hours').format(maskHorario);

    return `**[de ${horarioNascimentoBossInicio} até ${horarioNascimentoBossFim}]**`;
}

export { previsaoBoss }