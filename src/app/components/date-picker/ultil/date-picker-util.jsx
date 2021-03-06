let subtractMonth = ({day, month, year}) => {
    if (month == 1) {
        return {
            day: day,
            month: 12,
            year: parseInt(year) - 1
        }
    } else {
        return {
            day: day,
            month: parseInt(month) - 1,
            year: year
        }
    }
};

let plusMonth = ({day, month, year}) => {
    if (month == 12) {
        return {
            day: day,
            month: 1,
            year: parseInt(year) + 1
        }
    } else {
        return {
            day: day,
            month: parseInt(month) + 1,
            year: year
        }
    }
};


let daysInMonth = (month, year) => new Date(year, month, 0).getDate();

let daysInLastMonth = (month, year) => {
    let lastMonth = month == 1 ? 12 : month - 1;
    let _year = month == 1 ? year - 1 : year;

    return daysInMonth(lastMonth, _year);
};


let genCalendar = ({month = new Date().getMonth() + 1, year = new Date().getFullYear()}) => {
    let result = [];
    let startIndex = new Date(year, month - 1, 1, 0, 0, 0).getDay();
    let endIndex = daysInMonth(month, year);

    let dayNextMonth = 1;

    for (let i = 0; i < 42; i++) {
        if (i < startIndex) {

            const subTractMonth = subtractMonth({
                month: month,
                day: daysInLastMonth(month, year) - startIndex + i + 1,
                year
            });

            result.push({
                ...subTractMonth,
                oldDay: true
            });
        }
        else if (i >= startIndex && (i - startIndex + 1) <= endIndex) {
            result.push({
                month,
                day: i - startIndex + 1,
                year
            });
        }
        else {
            const addMonth = plusMonth({
                month: month,
                day: dayNextMonth,
                year
            });

            result.push({
                ...addMonth,
                oldDay: true
            });
            dayNextMonth++;
        }

    }
    return result;
};

let toDate = (date) => {
    if (typeof date === "string") return new Date(date);
    const {year, month, day = 1} = date;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
};


let compareDate = (date1, date2) => {
    if (!date1 || date1 == null || !date2  || date2 == null) return 1;
    return toDate(date1).getTime() - toDate(date2).getTime()
};


let formatDate = (date) => ({
    day: new Date(date).getDate(),
    month: new Date(date).getMonth() + 1,
    year: new Date(date).getFullYear()
});


let parseDate = (oriDate, date) => {
    let _date =  new Date(oriDate);
    _date.setDate(date.day);
    _date.setMonth(date.month - 1);
    _date.setFullYear(date.year);
    return _date;
};

let genListYear = (year) => {
    let currentYear = year || new Date().getFullYear();
    let years = [];
    for (let i = currentYear - 100 < 1 ? 1 : currentYear - 100; i <= currentYear + 100; i++) {
        years.push(i);
    }

    return years;
};

export let datePickerUtil = {
    subtractMonth,
    plusMonth,
    genCalendar,
    compareDate,
    parseDate,
    toDate,
    genListYear,
    formatDate
};