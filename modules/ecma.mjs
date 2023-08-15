const multiplicar = (a, b) => a * b;
const dividir = (a, b) => a / b;

//La extension .mjs permite trabajar con el sistema de modulos de CommonJS al margen de que en el package.json le indiquemos que trabajaremos con CommonJS
export { multiplicar, dividir };
