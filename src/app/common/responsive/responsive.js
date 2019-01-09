
const {ResponsiveFactory} = require("./responsive-factory.js");

export const sizes = [
    {name: "xs", minWidth: 0},
    {name: "sm", minWidth: 768},
    {name: "md", minWidth: 1214},
    {name: "lg", minWidth: 1280},
];

export const responsive = ResponsiveFactory.createResponsive(sizes);