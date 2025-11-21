import { format, parseISO, startOfDay, eachDayOfInterval, differenceInDays } from 'date-fns';

/**
 * Calculate registration trends over time
 */
export function calculateRegistrationTrends(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            dailyCounts: [],
            totalOnline: 0,
            totalOnsite: 0,
            peakDay: null,
            currentRate: 0,
            projection: 0
        };
    }

    // Group by date
    const dateMap = new Map();
    let onlineCount = 0;
    let onsiteCount = 0;

    registrations.forEach(reg => {
        const date = format(parseISO(reg.created_at), 'yyyy-MM-dd');
        const existing = dateMap.get(date) || { date, online: 0, onsite: 0, total: 0 };

        existing.total++;
        if (reg.participation_mode === 'Online') {
            existing.online++;
            onlineCount++;
        } else {
            existing.onsite++;
            onsiteCount++;
        }

        dateMap.set(date, existing);
    });

    // Convert to array and sort
    const dailyCounts = Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // Find peak day
    const peakDay = dailyCounts.reduce((max, day) =>
        day.total > max.total ? day : max
        , dailyCounts[0]);

    // Calculate average daily rate (last 7 days)
    const recentDays = dailyCounts.slice(-7);
    const currentRate = recentDays.reduce((sum, day) => sum + day.total, 0) / recentDays.length;

    // Project total (assuming current rate continues)
    const eventDate = new Date('2025-04-14');
    const today = new Date();
    const daysRemaining = differenceInDays(eventDate, today);
    const projection = registrations.length + (currentRate * daysRemaining);

    return {
        dailyCounts,
        totalOnline: onlineCount,
        totalOnsite: onsiteCount,
        peakDay,
        currentRate: Math.round(currentRate * 10) / 10,
        projection: Math.round(projection)
    };
}

/**
 * Calculate daily arrivals forecast
 */
export function calculateDailyArrivals(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            arrivalsByDate: [],
            peakArrivalDate: null,
            totalArrivals: 0
        };
    }

    // Filter only onsite registrations
    const onsiteRegs = registrations.filter(reg => reg.participation_mode === 'Onsite');

    // Group by arrival date
    const dateMap = new Map();

    onsiteRegs.forEach(reg => {
        if (!reg.arrival_date) return;

        const date = format(parseISO(reg.arrival_date), 'yyyy-MM-dd');
        const existing = dateMap.get(date) || {
            date,
            count: 0,
            general: 0,
            hotel: 0,
            withMeals: 0,
            withinZaria: 0,
            outsideZaria: 0
        };

        existing.count++;

        if (reg.accommodation_type === 'General') existing.general++;
        if (reg.accommodation_type === 'Hotel') existing.hotel++;
        if (reg.location_type === 'Outside Zaria') {
            existing.outsideZaria++;
            existing.withMeals++;
        } else {
            existing.withinZaria++;
        }

        dateMap.set(date, existing);
    });

    // Convert to array and sort
    const arrivalsByDate = Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // Find peak arrival date
    const peakArrivalDate = arrivalsByDate.reduce((max, day) =>
        day.count > max.count ? day : max
        , arrivalsByDate[0] || null);

    return {
        arrivalsByDate,
        peakArrivalDate,
        totalArrivals: onsiteRegs.length
    };
}

/**
 * Calculate meal requirements
 */
export function calculateMealRequirements(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            dailyMeals: [],
            totalBreakfast: 0,
            totalLunch: 0,
            totalDinner: 0,
            totalMeals: 0
        };
    }

    // Only count onsite + outside_zaria attendees
    const mealEligible = registrations.filter(reg =>
        reg.participation_mode === 'Onsite' && reg.location_type === 'Outside Zaria'
    );

    // Event dates
    const eventStart = new Date('2025-04-14');
    const eventEnd = new Date('2025-04-20');
    const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });

    const dailyMeals = [];
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;

    eventDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');

        // Count attendees present on this day
        const attendeesPresent = mealEligible.filter(reg => {
            if (!reg.arrival_date || !reg.departure_date) return false;

            const arrival = startOfDay(parseISO(reg.arrival_date));
            const departure = startOfDay(parseISO(reg.departure_date));
            const current = startOfDay(day);

            return current >= arrival && current <= departure;
        });

        const count = attendeesPresent.length;

        dailyMeals.push({
            date: dateStr,
            breakfast: count,
            lunch: count,
            dinner: count,
            total: count * 3
        });

        totalBreakfast += count;
        totalLunch += count;
        totalDinner += count;
    });

    return {
        dailyMeals,
        totalBreakfast,
        totalLunch,
        totalDinner,
        totalMeals: totalBreakfast + totalLunch + totalDinner
    };
}

/**
 * Calculate accommodation statistics
 */
export function calculateAccommodationStats(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            generalRequests: 0,
            hotelRequests: 0,
            nightlyOccupancy: [],
            peakOccupancyDate: null,
            averageStayDuration: 0
        };
    }

    const onsiteRegs = registrations.filter(reg => reg.participation_mode === 'Onsite');

    const generalRequests = onsiteRegs.filter(reg => reg.accommodation_type === 'General').length;
    const hotelRequests = onsiteRegs.filter(reg => reg.accommodation_type === 'Hotel').length;

    // Calculate nightly occupancy
    const eventStart = new Date('2025-04-14');
    const eventEnd = new Date('2025-04-20');
    const eventDays = eachDayOfInterval({ start: eventStart, end: eventEnd });

    const nightlyOccupancy = [];

    eventDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');

        const occupants = onsiteRegs.filter(reg => {
            if (!reg.arrival_date || !reg.departure_date) return false;

            const arrival = startOfDay(parseISO(reg.arrival_date));
            const departure = startOfDay(parseISO(reg.departure_date));
            const current = startOfDay(day);

            return current >= arrival && current < departure; // Not counting departure day
        });

        nightlyOccupancy.push({
            date: dateStr,
            general: occupants.filter(r => r.accommodation_type === 'General').length,
            hotel: occupants.filter(r => r.accommodation_type === 'Hotel').length,
            total: occupants.length
        });
    });

    const peakOccupancyDate = nightlyOccupancy.reduce((max, night) =>
        night.total > max.total ? night : max
        , nightlyOccupancy[0] || null);

    // Calculate average stay duration
    const durations = onsiteRegs
        .filter(reg => reg.arrival_date && reg.departure_date)
        .map(reg => differenceInDays(parseISO(reg.departure_date), parseISO(reg.arrival_date)));

    const averageStayDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    return {
        generalRequests,
        hotelRequests,
        nightlyOccupancy,
        peakOccupancyDate,
        averageStayDuration: Math.round(averageStayDuration * 10) / 10
    };
}

/**
 * Calculate nationality breakdown
 */
export function calculateNationalityBreakdown(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            countries: [],
            totalCountries: 0,
            internationalCount: 0,
            localCount: 0
        };
    }

    const countryMap = new Map();
    let internationalCount = 0;
    let localCount = 0;

    registrations.forEach(reg => {
        const country = reg.nationality || 'Nigeria';
        const count = countryMap.get(country) || 0;
        countryMap.set(country, count + 1);

        if (country === 'Nigeria') {
            localCount++;
        } else {
            internationalCount++;
        }
    });

    const countries = Array.from(countryMap.entries())
        .map(([name, count]) => ({
            name,
            count,
            percentage: (count / registrations.length * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    return {
        countries,
        totalCountries: countries.length,
        internationalCount,
        localCount
    };
}

/**
 * Calculate branch distribution
 */
export function calculateBranchDistribution(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            branches: [],
            totalBranches: 0
        };
    }

    // Only count members with branches
    const members = registrations.filter(reg => reg.is_member && reg.branch);

    const branchMap = new Map();

    members.forEach(reg => {
        const count = branchMap.get(reg.branch) || 0;
        branchMap.set(reg.branch, count + 1);
    });

    const branches = Array.from(branchMap.entries())
        .map(([name, count]) => ({
            name,
            count,
            percentage: (count / members.length * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    return {
        branches,
        totalBranches: branches.length
    };
}

/**
 * Calculate unit distribution
 */
export function calculateUnitDistribution(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            units: [],
            totalUnits: 0
        };
    }

    const unitMap = new Map();

    registrations.forEach(reg => {
        if (!reg.church_unit) return;
        const count = unitMap.get(reg.church_unit) || 0;
        unitMap.set(reg.church_unit, count + 1);
    });

    const units = Array.from(unitMap.entries())
        .map(([name, count]) => ({
            name,
            count,
            percentage: (count / registrations.length * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    return {
        units,
        totalUnits: units.length
    };
}

/**
 * Calculate mode and location statistics
 */
export function calculateModeLocationStats(registrations) {
    if (!registrations || registrations.length === 0) {
        return {
            onlineCount: 0,
            onsiteCount: 0,
            withinZariaCount: 0,
            outsideZariaCount: 0,
            modePercentages: { online: 0, onsite: 0 },
            locationPercentages: { within: 0, outside: 0 }
        };
    }

    const onlineCount = registrations.filter(reg => reg.participation_mode === 'Online').length;
    const onsiteCount = registrations.filter(reg => reg.participation_mode === 'Onsite').length;

    // Location only applies to onsite
    const onsiteRegs = registrations.filter(reg => reg.participation_mode === 'Onsite');
    const withinZariaCount = onsiteRegs.filter(reg => reg.location_type === 'Within Zaria').length;
    const outsideZariaCount = onsiteRegs.filter(reg => reg.location_type === 'Outside Zaria').length;

    const total = registrations.length;

    return {
        onlineCount,
        onsiteCount,
        withinZariaCount,
        outsideZariaCount,
        modePercentages: {
            online: ((onlineCount / total) * 100).toFixed(1),
            onsite: ((onsiteCount / total) * 100).toFixed(1)
        },
        locationPercentages: {
            within: onsiteRegs.length > 0 ? ((withinZariaCount / onsiteRegs.length) * 100).toFixed(1) : 0,
            outside: onsiteRegs.length > 0 ? ((outsideZariaCount / onsiteRegs.length) * 100).toFixed(1) : 0
        }
    };
}
