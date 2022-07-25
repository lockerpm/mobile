export const relativeTime = function timeDifference(previous: number, lang: string = 'en') {
    const current = Math.floor(Date.now()); 

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    const relative = {
        vi: {
            s: "Vài giây trước",
            m1: " phút trước",
            m2: " phút trước",
            h1: " giờ trước",
            h2: " giờ trước",
            d1: " hôm qua",
            d2: " ngày trước",
            mo1: " tháng trước",
            mo2: " tháng trước",
            y1: "Năm trước"
        },
        en: {
            s: "Seconds ago",
            m1: "A minute ago",
            m2: " minutes ago",
            h1: "A hour ago",
            h2: " hours ago",
            d1: "Yesterday",
            d2: " days ago",
            mo1: "A month ago",
            mo2: " months ago",
            y1: "Years ago"
        }
    }

    if (elapsed < msPerMinute) {
         return relative[lang].s
    }

    else if (elapsed < msPerHour) {
        const t = Math.round(elapsed/msPerMinute)
        return t === 1 ? relative[lang].m1 : t + relative[lang].m2
    }

    else if (elapsed < msPerDay ) {
        const t = Math.round(elapsed/msPerHour)
         return t === 1 ? relative[lang].h1 : t + relative[lang].h2
    }

    else if (elapsed < msPerMonth) {
        const t = Math.round(elapsed/msPerDay)
        return t === 1 ? relative[lang].d1 : t + relative[lang].d2
    }

    else if (elapsed < msPerYear) {
        const t = Math.round(elapsed/msPerMonth)
        return t === 1 ? relative[lang].m1 : t + relative[lang].m2
    }

    else {
        return relative[lang].y1 
    }
}