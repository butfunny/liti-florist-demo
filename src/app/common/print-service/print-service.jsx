import React from "react";
import ReactDOM from "react-dom";

export const PrintService = {
    printBill({body}) {
        let $container = $('<div></div>');
        ReactDOM.render(body, $container[0]);
        const popupWindow = window.open("", "", "width=800,height=600");
        popupWindow.document.open();
        popupWindow.document.write($container[0].outerHTML);

        popupWindow.document.close();
        popupWindow.onload = function () {
            popupWindow.setTimeout(function () {
                popupWindow.print();
            }, 500);
        };
        $container.remove();
    }
}