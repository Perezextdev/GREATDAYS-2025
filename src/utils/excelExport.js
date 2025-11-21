import * as XLSX from 'xlsx';
import { format, parseISO, isValid } from 'date-fns';

// Helper to format date safely
const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatStr) : '';
};

// Helper to create a workbook with multiple sheets
const createWorkbook = () => XLSX.utils.book_new();

// Helper to add a sheet to a workbook
const addSheet = (workbook, data, sheetName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => (row[key] ? row[key].toString().length : 0))) + 2
    }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
};

// Helper to save workbook
const saveWorkbook = (workbook, filename) => {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * REPORT 1: ACCOMMODATION LISTS
 */
export const exportCompleteAccommodationList = (registrations) => {
    const workbook = createWorkbook();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

    // Filter for accommodation requests
    const accommodationReqs = registrations.filter(r => r.needs_accommodation);

    // SHEET 1: General Accommodation
    const generalData = accommodationReqs
        .filter(r => r.accommodation_type === 'General')
        .map(r => ({
            'Registration ID': r.id,
            'Full Name': r.full_name,
            'Phone': r.phone_number,
            'Email': r.email,
            'Nationality': r.nationality,
            'Gender': r.gender || '',
            'Branch': r.branch || 'N/A',
            'Unit': r.church_unit || 'N/A',
            'Arrival Date': formatDate(r.arrival_date),
            'Accommodation Type': r.accommodation_type,
            'Special Requests': '',
            'Assigned Room': '',
            'Checked In': 'No'
        }));
    addSheet(workbook, generalData, "General Accommodation");

    // SHEET 2: Hotel Accommodation
    const hotelData = accommodationReqs
        .filter(r => r.accommodation_type === 'Hotel')
        .map(r => ({
            'Registration ID': r.id,
            'Full Name': r.full_name,
            'Phone': r.phone_number,
            'Preferred Hotel': '',
            'Confirmation #': '',
            'Status': 'Pending'
        }));
    addSheet(workbook, hotelData, "Hotel Accommodation");

    // SHEET 3: Summary
    const summaryData = [
        { 'Category': 'Total Needing Accommodation', 'Count': accommodationReqs.length },
        { 'Category': 'General Requests', 'Count': generalData.length },
        { 'Category': 'Hotel/Family Requests', 'Count': hotelData.length }
    ];
    addSheet(workbook, summaryData, "Summary");

    saveWorkbook(workbook, `Accommodation_Master_List_${timestamp}`);
};

/**
 * REPORT 1b: DAILY ARRIVALS
 */
export const exportDailyArrivalsReport = (registrations) => {
    const workbook = createWorkbook();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

    // Group by arrival date
    const arrivalsByDate = registrations.reduce((acc, r) => {
        if (!r.arrival_date) return acc;
        const date = formatDate(r.arrival_date, 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(r);
        return acc;
    }, {});

    Object.keys(arrivalsByDate).sort().forEach(date => {
        const dayData = arrivalsByDate[date].map(r => ({
            'Arrival Time': '',
            'Full Name': r.full_name,
            'Phone': r.phone_number,
            'From Location': r.location_type || '',
            'Accommodation': r.needs_accommodation ? r.accommodation_type : 'None',
            'Transport Needed': 'No',
            'Picked Up': 'No'
        }));
        addSheet(workbook, dayData, `Arrivals - ${date}`);
    });

    saveWorkbook(workbook, `Daily_Arrivals_${timestamp}`);
};

/**
 * REPORT 1c: MEAL PLANNING
 */
export const exportMealPlanReport = (registrations) => {
    const workbook = createWorkbook();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

    // Filter: Outside Zaria attendees
    const mealAttendees = registrations.filter(r =>
        r.participation_mode === 'Onsite' &&
        r.location_type === 'Outside Zaria'
    );

    // SHEET 1: Attendee List
    const attendeeData = mealAttendees.map(r => ({
        'Full Name': r.full_name,
        'Phone': r.phone_number,
        'Arrival': formatDate(r.arrival_date),
        'Dietary Restrictions': '',
        'Total Days': ''
    }));
    addSheet(workbook, attendeeData, "Meal Attendees");

    // SHEET 2: Daily Counts
    const summaryData = [
        { 'Metric': 'Total Attendees with Meals', 'Value': mealAttendees.length },
        { 'Metric': 'Est. Daily Breakfasts', 'Value': mealAttendees.length },
        { 'Metric': 'Est. Daily Lunches', 'Value': mealAttendees.length },
        { 'Metric': 'Est. Daily Dinners', 'Value': mealAttendees.length }
    ];
    addSheet(workbook, summaryData, "Planning Summary");

    saveWorkbook(workbook, `Meal_Plan_${timestamp}`);
};

/**
 * REPORT 2: COMPLETE REGISTRATION EXPORT
 */
export const exportCompleteRegistrationList = (registrations) => {
    const workbook = createWorkbook();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

    // SHEET 1: All Registrations
    const allData = registrations.map(r => ({
        'ID': r.id,
        'Date': formatDate(r.created_at),
        'Title': r.title,
        'Full Name': r.full_name,
        'Email': r.email,
        'Phone': r.phone_number,
        'Nationality': r.nationality,
        'Mode': r.participation_mode,
        'Member': r.is_member ? 'Yes' : 'No',
        'Branch': r.branch || '',
        'Unit': r.church_unit || '',
        'Location': r.location_type || '',
        'Accommodation': r.needs_accommodation ? 'Yes' : 'No',
        'Arrival': formatDate(r.arrival_date)
    }));
    addSheet(workbook, allData, "All Registrations");

    // SHEET 2: Online Only
    const onlineData = allData.filter(r => r.Mode === 'Online');
    addSheet(workbook, onlineData, "Online Participants");

    // SHEET 3: Onsite Only
    const onsiteData = allData.filter(r => r.Mode === 'Onsite');
    addSheet(workbook, onsiteData, "Onsite Participants");

    // SHEET 4: Statistics
    const statsData = [
        { 'Metric': 'Total Registrations', 'Value': registrations.length },
        { 'Metric': 'Online', 'Value': onlineData.length },
        { 'Metric': 'Onsite', 'Value': onsiteData.length },
        { 'Metric': 'Members', 'Value': registrations.filter(r => r.is_member).length },
        { 'Metric': 'Non-Members', 'Value': registrations.filter(r => !r.is_member).length }
    ];
    addSheet(workbook, statsData, "Statistics");

    saveWorkbook(workbook, `Complete_Registrations_${timestamp}`);
};

/**
 * REPORT 3: CONTACT LISTS
 */
export const exportContactList = (registrations, type = 'complete') => {
    const workbook = createWorkbook();
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

    let data = [];
    let filename = `Contact_List_${type}_${timestamp}`;

    if (type === 'vip') {
        // Filter for titles like Reverend, Pastor
        data = registrations
            .filter(r => ['Reverend', 'Pastor', 'Bishop'].includes(r.title))
            .map(r => ({
                'Title': r.title,
                'Full Name': r.full_name,
                'Phone': r.phone_number,
                'Email': r.email,
                'Branch': r.branch || ''
            }));
        filename = `VIP_Leadership_List_${timestamp}`;
    } else {
        // Complete list
        data = registrations.map(r => ({
            'Full Name': r.full_name,
            'Phone': r.phone_number,
            'Email': r.email,
            'Mode': r.participation_mode,
            'Country': r.nationality
        }));
    }

    addSheet(workbook, data, "Contacts");
    saveWorkbook(workbook, filename);
};

/**
 * Generic export function
 */
export const exportToExcel = (data, filename) => {
    const workbook = createWorkbook();
    addSheet(workbook, data, "Sheet1");
    saveWorkbook(workbook, filename);
};

/**
 * LEGACY FUNCTIONS FOR BACKWARDS COMPATIBILITY
 */

export const exportBadgeManifest = (badges) => {
    const data = badges.map(badge => ({
        'Badge Number': badge.badge_number,
        'Full Name': badge.full_name,
        'Email': badge.email,
        'Unit': badge.church_unit,
        'Branch': badge.branch || 'N/A',
        'Location': badge.location_type === 'Outside Zaria' ? 'Outside Zaria' : 'Within Zaria',
        'Meals Included': badge.meal_ticket_issued ? 'Yes' : 'No',
        'Arrival Date': formatDate(badge.arrival_date),
        'Print Status': badge.print_status || 'Pending',
        'Generated': formatDate(badge.created_at)
    }));

    exportToExcel(data, `Badge_Manifest_${format(new Date(), 'yyyy-MM-dd')}`);
};

export const exportDailyArrivals = (arrivalData) => {
    const data = arrivalData.map(day => ({
        'Date': formatDate(day.date, 'MMM dd, yyyy (EEEE)'),
        'Total Arrivals': day.count,
        'General Accommodation': day.general,
        'Hotel Accommodation': day.hotel,
        'Meals Required': day.withMeals,
        'Within Zaria': day.withinZaria,
        'Outside Zaria': day.outsideZaria
    }));

    exportToExcel(data, `Daily_Arrivals_${format(new Date(), 'yyyy-MM-dd')}`);
};

export const exportMealPlan = (mealData) => {
    const data = mealData.map(day => ({
        'Date': formatDate(day.date, 'MMM dd, yyyy (EEEE)'),
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

export const exportAccommodationList = (registrations) => {
    const onsiteRegs = registrations
        .filter(reg => reg.participation_mode === 'Onsite' && reg.needs_accommodation)
        .sort((a, b) => new Date(a.arrival_date) - new Date(b.arrival_date));

    const data = onsiteRegs.map(reg => ({
        'Full Name': reg.full_name,
        'Email': reg.email,
        'Phone': reg.phone_number,
        'Accommodation Type': reg.accommodation_type === 'General' ? 'General' : 'Hotel',
        'Arrival Date': formatDate(reg.arrival_date),
        'Duration (nights)': '', // Calc if departure exists
        'Location': reg.location_type === 'Outside Zaria' ? 'Outside Zaria' : 'Within Zaria',
        'Meals Included': reg.location_type === 'Outside Zaria' ? 'Yes' : 'No',
        'Unit': reg.church_unit,
        'Branch': reg.branch || 'N/A'
    }));

    exportToExcel(data, `Accommodation_List_${format(new Date(), 'yyyy-MM-dd')}`);
};

