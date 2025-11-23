import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const generateComprehensiveReport = (registrations) => {
    const wb = XLSX.utils.book_new();

    // 1. Complete Registration List
    const allRegsData = registrations.map(r => ({
        'Full Name': r.full_name,
        'Email': r.email,
        'Phone': r.phone,
        'Gender': r.gender,
        'Type': r.registration_type,
        'Mode': r.participation_mode,
        'Location': r.location_type,
        'Branch': r.church_branch || 'N/A',
        'Unit': r.church_unit || 'N/A',
        'Member Status': r.is_member ? 'Member' : 'Non-Member',
        'Accommodation': r.accommodation_type || 'None',
        'Arrival Date': r.arrival_date || 'N/A',
        'Departure Date': r.departure_date || 'N/A',
        'Registered At': format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss')
    }));
    const wsAll = XLSX.utils.json_to_sheet(allRegsData);
    XLSX.utils.book_append_sheet(wb, wsAll, "All Registrations");

    // 2. Accommodation List
    const accommodationData = registrations
        .filter(r => r.needs_accommodation)
        .map(r => ({
            'Full Name': r.full_name,
            'Gender': r.gender,
            'Phone': r.phone,
            'Type': r.accommodation_type,
            'Arrival': r.arrival_date,
            'Departure': r.departure_date,
            'Special Needs': r.special_needs || 'None'
        }));
    const wsAccom = XLSX.utils.json_to_sheet(accommodationData);
    XLSX.utils.book_append_sheet(wb, wsAccom, "Accommodation");

    // 3. Meal Planning (Outside Zaria)
    const mealData = registrations
        .filter(r => r.location_type === 'Outside Zaria' && r.participation_mode === 'Onsite')
        .map(r => ({
            'Full Name': r.full_name,
            'Dietary Requirements': r.dietary_requirements || 'None',
            'Arrival': r.arrival_date,
            'Departure': r.departure_date
        }));
    const wsMeals = XLSX.utils.json_to_sheet(mealData);
    XLSX.utils.book_append_sheet(wb, wsMeals, "Meal Planning");

    // 4. Daily Arrivals
    const arrivalDates = [...new Set(registrations.map(r => r.arrival_date).filter(Boolean))].sort();
    const arrivalData = arrivalDates.map(date => {
        const dailyRegs = registrations.filter(r => r.arrival_date === date);
        return {
            'Date': date,
            'Total Arrivals': dailyRegs.length,
            'General Accom': dailyRegs.filter(r => r.accommodation_type === 'General').length,
            'Hotel Accom': dailyRegs.filter(r => r.accommodation_type === 'Hotel').length,
            'Names': dailyRegs.map(r => r.full_name).join(', ')
        };
    });
    const wsArrivals = XLSX.utils.json_to_sheet(arrivalData);
    XLSX.utils.book_append_sheet(wb, wsArrivals, "Daily Arrivals");

    // 5. Contact List
    const contactData = registrations.map(r => ({
        'Name': r.full_name,
        'Phone': r.phone,
        'Email': r.email,
        'Branch': r.church_branch || 'N/A'
    }));
    const wsContacts = XLSX.utils.json_to_sheet(contactData);
    XLSX.utils.book_append_sheet(wb, wsContacts, "Contacts");

    // Save File
    const fileName = `GREAT_DAYS_Report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

export const exportBadgeManifest = (badges) => {
    const data = badges.map(b => ({
        'Badge Number': b.badge_number,
        'Full Name': b.full_name,
        'Email': b.email,
        'Phone': b.phone,
        'Unit': b.church_unit,
        'Branch': b.branch || 'N/A',
        'Location': b.location_type,
        'Meal Ticket': b.meal_ticket_issued ? 'Yes' : 'No',
        'Badge URL': b.badge_url,
        'Generated At': format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }));

    exportToExcel(data, `Badge_Manifest_${format(new Date(), 'yyyy-MM-dd_HHmm')}`, 'Badge Manifest');
};

export const exportDailyArrivals = (arrivalsData) => {
    const data = arrivalsData.map(d => ({
        'Date': format(new Date(d.date), 'yyyy-MM-dd'),
        'Total Arrivals': d.count,
        'With Meals': d.withMeals,
        'Without Meals': d.count - d.withMeals
    }));
    exportToExcel(data, `Daily_Arrivals_${format(new Date(), 'yyyy-MM-dd_HHmm')}`, 'Arrivals');
};

export const exportMealPlan = (mealData) => {
    const data = mealData.map(d => ({
        'Date': format(new Date(d.date), 'yyyy-MM-dd'),
        'Breakfast': d.breakfast,
        'Lunch': d.lunch,
        'Dinner': d.dinner,
        'Total': d.breakfast + d.lunch + d.dinner
    }));
    exportToExcel(data, `Meal_Plan_${format(new Date(), 'yyyy-MM-dd_HHmm')}`, 'Meals');
};

export const exportAccommodationList = (registrations) => {
    const data = registrations
        .filter(r => r.needs_accommodation)
        .map(r => ({
            'Full Name': r.full_name,
            'Gender': r.gender,
            'Type': r.accommodation_type,
            'Arrival': r.arrival_date,
            'Departure': r.departure_date,
            'Special Needs': r.special_needs || 'None',
            'Phone': r.phone
        }));
    exportToExcel(data, `Accommodation_List_${format(new Date(), 'yyyy-MM-dd_HHmm')}`, 'Accommodation');
};
