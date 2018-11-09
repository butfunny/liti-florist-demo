import React from "react";
import ReactDOM from "react-dom";

export const PrintService = {
    printBill({body}) {
        let $container = $('<div></div>');
        ReactDOM.render(body, $container[0]);
        const popupWindow = window.open("", "", "width=800,height=600");
        popupWindow.document.open();
        popupWindow.document.write(`
            <html lang="en">
            <head>
                <link type="text/css" href="/assets/css/argon.min.css" rel="stylesheet">
                <link type="text/css" href="/assets/css/docs.min.css" rel="stylesheet">
                <link href="/assets/css/style.css" rel="stylesheet" type="text/css"/>
            </head>
            
            <body>
                ${$container[0].outerHTML}
            </body>
            </html>
        `);

        popupWindow.document.close();
        popupWindow.onload = function () {
            popupWindow.setTimeout(function () {
                popupWindow.print();
            }, 500);
        };
        $container.remove();
    }
}