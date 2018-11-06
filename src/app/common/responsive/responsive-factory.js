const debounce = require("lodash/debounce");

const ResponsiveFactory = {
    createResponsive(sizes) {

        let listeners = [];
        var currentSize = null;

        var checkSize = function() {
            var newSize = translateWidth(window.innerWidth);
            if (currentSize==null || currentSize != newSize) {
                currentSize = newSize;
                listeners.forEach((l)=> l());
            }
        };

        function translateWidth(width) {
            for (var i = sizes.length - 1; i > -1; i--) {
                var size = sizes[i];
                if (width >= size.minWidth) {
                    return size.name;
                }
            }
        }

        $(window).resize(debounce(checkSize, 250));
        checkSize();

        function sizeIndex(sizeName) {
            return sizes.findIndex((size) => size.name == sizeName);
        }

        return {
            onChange(listener) {
                listeners.push(listener);

                return ()=> {
                    listeners.splice(listeners.indexOf(listener), 1);
                };
            },
            currentSize: () => currentSize,
            ge(minSize) {
                return sizeIndex(currentSize) >= sizeIndex(minSize);
            },
            le(minSize) {
                return sizeIndex(currentSize) <= sizeIndex(minSize);
            },
            lt(maxSize) {
                return sizeIndex(currentSize) <  sizeIndex(maxSize);
            },
            gt(maxSize) {
                return sizeIndex(currentSize) >  sizeIndex(maxSize);
            },
            eq(size) {
                return currentSize == size;
            }
        };
    }
};

exports.ResponsiveFactory = ResponsiveFactory;
