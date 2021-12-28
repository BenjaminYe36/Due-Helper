class Util {
    static getDateFormatString(locale: string) {
        const formatObj = new Intl.DateTimeFormat(locale).formatToParts(new Date());

        return formatObj
            .map(obj => {
                switch (obj.type) {
                    case "day":
                        return "DD";
                    case "month":
                        return "MM";
                    case "year":
                        return "YYYY";
                    default:
                        return obj.value;
                }
            })
            .join("");
    }
}

export default Util;