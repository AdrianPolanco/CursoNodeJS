const sumar = (a, b) => a + b;
const restar = (a, b) => a - b;

//La extension .cjs permite trabajar con el sistema de modulos de CommonJS al margen de que en el package.json le indiquemos que trabajaremos con ECMAScript modules
module.exports = { sumar, restar };
