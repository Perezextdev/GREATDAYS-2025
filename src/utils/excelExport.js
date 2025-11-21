import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';

export const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export badge manifest with meal status
 */
export const exportBadgeManifest = (badges) => {
    const data = badges.map(badge => ({
        'Badge Number': badge.badge_number,
        'Full Name': badge.full_name,
        'Email': badge.email,
        'Unit': badge.unit,
        'Branch': badge.branch || 'N/A',
        'Location': badge.location === 'outside_zaria' ? 'Outside Zaria' : 'Within Zaria',
        'Meals Included': badge.meals_included ? 'Yes' : 'No',
        'Arrival Date': format(parseISO(badge.arrival_date), 'MMM dd, yyyy'),
        'Print Status': badge.print_status || 'Pending',
        'Generated': format(parseISO(badge.created_at), 'MMM dd, yyyy HH:mm')
    }));

    exportToExcel(data, `Badge_Manifest_${format(new Date(), 'yyyy-MM-dd')}`);
};

/**
 * Export daily arrivals breakdown
 */
export const exportDailyArrivals = (arrivalData) => {
    const data = arrivalData.map(day => ({
        'Date': format(parseISO(day.date), 'MMM dd, yyyy (EEEE)'),
        'Total Arrivals': day.count,
        'General Accommodation': day.general,
        'Hotel Accommodation': day.hotel,
        'Meals Required': day.withMeals,
        'Within Zaria': day.withinZaria,
        'Outside Zaria': day.outsideZaria
    }));

    exportToExcel(data, `Daily_Arrivals_${format(new Date(), 'yyyy-MM-dd')}`);
};

/**
 * Export meal planning data for catering
 */
export const exportMealPlan = (mealData) => {
    const data = mealData.map(day => ({
        'Date': format(parseISO(day.date), 'MMM dd, yyyy (EEEE)'),
        'Breakfast': day.breakfast,
        'Lunch': day.lunch,
        'Dinner': day.dinner,
        'Daily Total': day.total
    }));

    // Add summary row
    const totals = mealData.reduce((acc, day) => ({
        breakfast: acc.breakfast + day.breakfast,
        lunch: acc.lunch + day.lunch,
        dinner: acc.dinner + day.dinner,
        total: acc.total + day.total
    }), { breakfast: 0, lunch: 0, dinner: 0, total: 0 });

    data.push({
        'Date': 'TOTAL',
        'Breakfast': totals.breakfast,
        'Lunch': totals.lunch,
        'Dinner': totals.dinner,
        'Daily Total': totals.total
    });

    exportToExcel(data, `Meal_Plan_${format(new Date(), 'yyyy-MM-dd')}`);
};

/**
 * Export accommodation list sorted by arrival date
 */
export const exportAccommodationList = (registrations) => {
    const onsiteRegs = registrations
        .filter(reg => reg.mode === 'onsite')
        .sort((a, b) => new Date(a.arrival_date) - new Date(b.arrival_date));

    const data = onsiteRegs.map(reg => ({
        'Full Name': reg.full_name,
        'Email': reg.email,
        'Phone': reg.phone,
        'Accommodation Type': reg.accommodation === 'general' ? 'General' : 'Hotel',
        'Arrival Date': format(parseISO(reg.arrival_date), 'MMM dd, yyyy'),
        'Departure Date': format(parseISO(reg.departure_date), 'MMM dd, yyyy'),
        'Duration (nights)': Math.ceil((new Date(reg.departure_date) - new Date(reg.arrival_date)) / (1000 * 60 * 60 * 24)),
        'Location': reg.location === 'outside_zaria' ? 'Outside Zaria' : 'Within Zaria',
        'Meals Included': reg.location === 'outside_zaria' ? 'Yes' : 'No',
        'Unit': reg.unit,
        'Branch': reg.branch || 'N/A'
    }));

    exportToExcel(data, `Accommodation_List_${format(new Date(), 'yyyy-MM-dd')}`);
};
