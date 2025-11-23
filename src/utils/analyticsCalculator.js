import { format, parseISO, startOfDay, addDays, differenceInDays, isSameDay, isAfter, isBefore } from 'date-fns';

export const calculateRegistrationTrends = (registrations) => {
    if (!registrations.length) return { dailyCounts: [], currentRate: 0, projection: 0, peakDay: null };

    // Group by date
    const dailyMap = registrations.reduce((acc, reg) => {
        const date = format(parseISO(reg.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = { date, total: 0, online: 0, onsite: 0 };
        }
        acc[date].total++;
        if (reg.participation_mode === 'Online') acc[date].online++;
        if (reg.participation_mode === 'Onsite') acc[date].onsite++;
        return acc;
    }, {});

    const dailyCounts = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate current rate (last 7 days)
    const today = new Date();
    const last7Days = dailyCounts.filter(d => differenceInDays(today, parseISO(d.date)) <= 7);
    const currentRate = last7Days.length ? Math.round(last7Days.reduce((sum, d) => sum + d.total, 0) / 7) : 0;

    // Simple projection (linear)
    const daysUntilEvent = differenceInDays(new Date('2025-04-16'), today); // Assuming event date
    const projection = registrations.length + (currentRate * Math.max(0, daysUntilEvent));

    // Find peak day
    const peakDay = dailyCounts.reduce((max, current) => (current.total > (max?.total || 0) ? current : max), null);

    return { dailyCounts, currentRate, projection, peakDay };
};

export const calculateDailyArrivals = (registrations) => {
    const arrivalsMap = registrations
        .filter(r => r.participation_mode === 'Onsite' && r.arrival_date)
        .reduce((acc, reg) => {
            const date = reg.arrival_date;
            if (!acc[date]) {
                acc[date] = { date, count: 0, withMeals: 0 };
            }
            acc[date].count++;
            if (reg.meal_ticket_issued) acc[date].withMeals++;
            return acc;
        }, {});

    const arrivalsByDate = Object.values(arrivalsMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalArrivals = arrivalsByDate.reduce((sum, d) => sum + d.count, 0);
    const peakArrivalDate = arrivalsByDate.reduce((max, current) => (current.count > (max?.count || 0) ? current : max), null);

    return { arrivalsByDate, totalArrivals, peakArrivalDate };
};

export const calculateMealRequirements = (registrations) => {
    // Filter for onsite attendees outside Zaria
    const mealAttendees = registrations.filter(r =>
        r.participation_mode === 'Onsite' &&
        r.location_type === 'Outside Zaria' &&
        r.arrival_date &&
        r.departure_date
    );

    const dailyMeals = {};
    const eventDates = []; // Populate with actual event dates if known, or derive from data

    // Derive range from data
    if (mealAttendees.length) {
        const dates = mealAttendees.map(r => new Date(r.arrival_date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...mealAttendees.map(r => new Date(r.departure_date))));

        let curr = minDate;
        while (curr <= maxDate) {
            const dateStr = format(curr, 'yyyy-MM-dd');
            dailyMeals[dateStr] = { date: dateStr, breakfast: 0, lunch: 0, dinner: 0 };
            curr = addDays(curr, 1);
        }
    }

    mealAttendees.forEach(reg => {
        const arrival = parseISO(reg.arrival_date);
        const departure = parseISO(reg.departure_date);

        let curr = arrival;
        while (curr < departure) { // Assume departure day has breakfast only or none? Let's assume full days between
            const dateStr = format(curr, 'yyyy-MM-dd');
            if (dailyMeals[dateStr]) {
                dailyMeals[dateStr].breakfast++;
                dailyMeals[dateStr].lunch++;
                dailyMeals[dateStr].dinner++;
            }
            curr = addDays(curr, 1);
        }
    });

    const dailyMealsArray = Object.values(dailyMeals).sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalMeals = dailyMealsArray.reduce((sum, d) => sum + d.breakfast + d.lunch + d.dinner, 0);

    return {
        dailyMeals: dailyMealsArray,
        totalBreakfast: dailyMealsArray.reduce((sum, d) => sum + d.breakfast, 0),
        totalLunch: dailyMealsArray.reduce((sum, d) => sum + d.lunch, 0),
        totalDinner: dailyMealsArray.reduce((sum, d) => sum + d.dinner, 0),
        totalMeals
    };
};

export const calculateAccommodationStats = (registrations) => {
    const accommodationRegs = registrations.filter(r => r.needs_accommodation);

    const generalRequests = accommodationRegs.filter(r => r.accommodation_type === 'General').length;
    const hotelRequests = accommodationRegs.filter(r => r.accommodation_type === 'Hotel').length;

    // Calculate nightly occupancy
    const occupancyMap = {};
    accommodationRegs.forEach(reg => {
        if (reg.arrival_date && reg.departure_date) {
            let curr = parseISO(reg.arrival_date);
            const end = parseISO(reg.departure_date);

            while (curr < end) {
                const dateStr = format(curr, 'yyyy-MM-dd');
                if (!occupancyMap[dateStr]) {
                    occupancyMap[dateStr] = { date: dateStr, general: 0, hotel: 0, total: 0 };
                }
                if (reg.accommodation_type === 'General') occupancyMap[dateStr].general++;
                else if (reg.accommodation_type === 'Hotel') occupancyMap[dateStr].hotel++;
                occupancyMap[dateStr].total++;
                curr = addDays(curr, 1);
            }
        }
    });

    const nightlyOccupancy = Object.values(occupancyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const peakOccupancyDate = nightlyOccupancy.reduce((max, current) => (current.total > (max?.total || 0) ? current : max), null);

    // Average stay duration
    const totalNights = accommodationRegs.reduce((sum, reg) => {
        if (reg.arrival_date && reg.departure_date) {
            return sum + differenceInDays(parseISO(reg.departure_date), parseISO(reg.arrival_date));
        }
        return sum;
    }, 0);
    const averageStayDuration = accommodationRegs.length ? (totalNights / accommodationRegs.length).toFixed(1) : 0;

    return { generalRequests, hotelRequests, nightlyOccupancy, peakOccupancyDate, averageStayDuration };
};

export const calculateNationalityBreakdown = (registrations) => {
    const countryMap = registrations.reduce((acc, reg) => {
        const country = reg.nationality || 'Nigeria'; // Default to Nigeria if missing
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {});

    const countries = Object.entries(countryMap)
        .map(([name, count]) => ({
            name,
            count,
            percentage: ((count / registrations.length) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    const localCount = countryMap['Nigeria'] || 0;
    const internationalCount = registrations.length - localCount;

    return { countries, totalCountries: countries.length, localCount, internationalCount };
};

export const calculateBranchDistribution = (registrations) => {
    const branchMap = registrations.reduce((acc, reg) => {
        if (reg.church_branch) {
            acc[reg.church_branch] = (acc[reg.church_branch] || 0) + 1;
        }
        return acc;
    }, {});

    const branches = Object.entries(branchMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { branches };
};

export const calculateUnitDistribution = (registrations) => {
    const unitMap = registrations.reduce((acc, reg) => {
        if (reg.church_unit) {
            acc[reg.church_unit] = (acc[reg.church_unit] || 0) + 1;
        }
        return acc;
    }, {});

    const units = Object.entries(unitMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { units };
};

export const calculateModeLocationStats = (registrations) => {
    const onlineCount = registrations.filter(r => r.participation_mode === 'Online').length;
    const onsiteCount = registrations.filter(r => r.participation_mode === 'Onsite').length;

    const withinZariaCount = registrations.filter(r => r.location_type === 'Within Zaria').length;
    const outsideZariaCount = registrations.filter(r => r.location_type === 'Outside Zaria').length;

    return {
        onlineCount,
        onsiteCount,
        withinZariaCount,
        outsideZariaCount,
        modePercentages: {
            online: ((onlineCount / registrations.length) * 100).toFixed(1),
            onsite: ((onsiteCount / registrations.length) * 100).toFixed(1)
        },
        locationPercentages: {
            within: onsiteCount ? ((withinZariaCount / onsiteCount) * 100).toFixed(1) : 0,
            outside: onsiteCount ? ((outsideZariaCount / onsiteCount) * 100).toFixed(1) : 0
        }
    };
};
