import QRCode from 'qrcode';
import { supabase } from './supabaseClient';

/**
 * Generate next sequential badge number
 */
export async function generateBadgeNumber() {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('badge_number')
            .like('badge_number', 'GD2025-%')
            .order('badge_number', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!data || data.length === 0) {
            return 'GD2025-0001';
        }

        const lastNumber = parseInt(data[0].badge_number.split('-')[1]);
        const nextNumber = lastNumber + 1;
        return `GD2025-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating badge number:', error);
        throw error;
    }
}

/**
 * Check if registration qualifies for badge generation
 */
export function shouldGenerateBadge(registration) {
    return registration.mode === 'onsite';
}

/**
 * Check if attendee should receive meal tickets
 */
export function shouldIncludeMeals(registration) {
    return registration.mode === 'onsite' && registration.location === 'outside_zaria';
}

/**
 * Get accent color based on membership status
 */
export function getAccentColor(isMember) {
    return isMember ? '#2563eb' : '#9333ea'; // Blue for members, Purple for non-members
}

/**
 * Generate QR code data URL
 */
export async function generateQRCode(data) {
    try {
        const qrData = JSON.stringify(data);
        const qrCodeUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

/**
 * Create initials avatar
 */
export function createInitialsAvatar(name, accentColor) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 180;

    canvas.width = size;
    canvas.height = size;

    // Draw circle background
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw initials
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(countryCode) {
    if (!countryCode || countryCode === 'NG') return '🇳🇬';

    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());

    return String.fromCodePoint(...codePoints);
}

/**
 * Create badge as HTML and convert to canvas
 */
export async function createBadge(registration) {
    const {
        badge_number,
        full_name,
        title,
        church_ministry,
        unit,
        branch,
        nationality,
        mode,
        location,
        email,
        profile_photo,
        is_member,
        id
    } = registration;

    const mealsIncluded = shouldIncludeMeals(registration);
    const accentColor = getAccentColor(is_member);

    // Generate QR code
    const qrData = {
        badge_number,
        registration_id: id,
        full_name,
        email,
        mode: mode?.toLowerCase(),
        meals: mealsIncluded
    };
    const qrCodeUrl = await generateQRCode(qrData);

    // Create profile image or initials
    const profileImageUrl = profile_photo || createInitialsAvatar(full_name, accentColor);

    // Create badge HTML
    const badgeHTML = `
        <div style="
            width: 1200px;
            height: 900px;
            background: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            position: relative;
            box-sizing: border-box;
        ">
            <!-- Top Section (Header) -->
            <div style="
                height: 225px;
                background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%);
                border-bottom: 8px solid ${accentColor};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px;
            ">
                <div style="
                    width: 120px;
                    height: 120px;
                    background: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 64px;
                    font-weight: 900;
                    color: ${accentColor};
                    margin-bottom: 15px;
                ">GD</div>
                <div style="
                    color: white;
                    font-size: 42px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    text-align: center;
                ">GREAT DAYS 2025</div>
            </div>

            <!-- Middle Section (Profile) -->
            <div style="
                height: 450px;
                padding: 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #fafafa;
            ">
                <!-- Profile Photo -->
                <div style="
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 6px solid ${accentColor};
                    margin-bottom: 20px;
                    background: white;
                ">
                    <img src="${profileImageUrl}" alt="${full_name}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    " crossorigin="anonymous" />
                </div>

                <!-- Name -->
                <div style="
                    font-size: 36px;
                    font-weight: 900;
                    color: #1e293b;
                    text-align: center;
                    margin-bottom: 8px;
                    max-width: 90%;
                    line-height: 1.2;
                ">${full_name}</div>

                <!-- Title -->
                ${title ? `<div style="
                    font-size: 22px;
                    font-weight: 600;
                    color: #64748b;
                    text-align: center;
                    margin-bottom: 12px;
                ">${title}</div>` : ''}

                <!-- Church/Ministry -->
                ${church_ministry ? `<div style="
                    font-size: 20px;
                    color: #475569;
                    text-align: center;
                    margin-bottom: 16px;
                    max-width: 85%;
                ">${church_ministry}</div>` : ''}

                <!-- Unit Badge -->
                <div style="
                    display: inline-block;
                    padding: 8px 20px;
                    background: ${accentColor};
                    color: white;
                    border-radius: 20px;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 8px;
                ">${unit}</div>

                <!-- Branch (if member) -->
                ${is_member && branch ? `<div style="
                    font-size: 16px;
                    color: #64748b;
                    font-weight: 600;
                ">${branch} Branch</div>` : ''}

                <!-- Nationality -->
                <div style="
                    font-size: 16px;
                    color: #64748b;
                    margin-top: 12px;
                ">${getCountryFlag(nationality)} ${nationality || 'Nigeria'}</div>
            </div>

            <!-- Bottom Section (Footer) -->
            <div style="
                height: 225px;
                padding: 30px 40px;
                background: white;
                border-top: 2px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <!-- Left: Badges -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                ">
                    <!-- Mode Badge -->
                    <div style="
                        display: inline-block;
                        padding: 10px 18px;
                        background: #10b981;
                        color: white;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        text-transform: uppercase;
                    ">📍 ONSITE</div>

                    <!-- Location Badge -->
                    <div style="
                        display: inline-block;
                        padding: 10px 18px;
                        background: ${location === 'outside_zaria' ? '#3b82f6' : '#94a3b8'};
                        color: white;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                    ">${location === 'outside_zaria' ? '🏨 Outside Zaria' : '🏠 Within Zaria'}</div>
                </div>

                <!-- Center: QR Code -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                ">
                    <img src="${qrCodeUrl}" alt="QR Code" style="
                        width: 200px;
                        height: 200px;
                        border: 3px solid #e2e8f0;
                        border-radius: 12px;
                    " crossorigin="anonymous" />
                </div>

                <!-- Right: Meal Ticket (Conditional) -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: center;
                    flex: 1;
                ">
                    ${mealsIncluded ? `
                        <div style="
                            padding: 20px 24px;
                            background: #22c55e;
                            color: white;
                            border-radius: 16px;
                            text-align: center;
                            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                        ">
                            <div style="
                                font-size: 36px;
                                margin-bottom: 8px;
                            ">🍽️</div>
                            <div style="
                                font-size: 18px;
                                font-weight: 900;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">MEALS<br/>INCLUDED</div>
                        </div>
                    ` : '<div></div>'}
                </div>
            </div>

            <!-- Badge Number (Bottom Center) -->
            <div style="
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                color: #94a3b8;
                font-weight: 700;
                letter-spacing: 1px;
            ">${badge_number}</div>
        </div>
    `;

    return badgeHTML;
}

/**
 * Convert badge HTML to PNG blob
 */
export async function convertBadgeToImage(badgeHTML) {
    const html2canvas = (await import('html2canvas')).default;

    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = badgeHTML;
    document.body.appendChild(container);

    try {
        // Wait for images to load
        const images = container.querySelectorAll('img');
        await Promise.all(
            Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })
        );

        // Convert to canvas
        const canvas = await html2canvas(container.firstElementChild, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false
        });

        // Convert canvas to blob
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * Upload badge to Supabase Storage
 */
export async function uploadBadgeToStorage(badgeNumber, blob) {
    try {
        const fileName = `${badgeNumber}.png`;
        const filePath = `badges/${fileName}`;

        const { data, error } = await supabase.storage
            .from('event-files')
            .upload(filePath, blob, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('event-files')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading badge:', error);
        throw error;
    }
}

/**
 * Generate and save badge for registration
 */
export async function generateAndSaveBadge(registration) {
    try {
        if (!shouldGenerateBadge(registration)) {
            throw new Error('Registration does not qualify for badge generation');
        }

        // Generate badge number if not exists
        const badgeNumber = registration.badge_number || await generateBadgeNumber();
        const mealsIncluded = shouldIncludeMeals(registration);

        // Create badge
        const badgeHTML = await createBadge({
            ...registration,
            badge_number: badgeNumber
        });

        // Convert to image
        const blob = await convertBadgeToImage(badgeHTML);

        // Upload to storage
        const badgeUrl = await uploadBadgeToStorage(badgeNumber, blob);

        // Update registration
        const { error } = await supabase
            .from('registrations')
            .update({
                badge_number: badgeNumber,
                badge_url: badgeUrl,
                badge_generated: true,
                meals_included: mealsIncluded
            })
            .eq('id', registration.id);

        if (error) throw error;

        return {
            badgeNumber,
            badgeUrl,
            mealsIncluded
        };
    } catch (error) {
        console.error('Error generating badge:', error);
        throw error;
    }
}

/**
 * Download badge as PNG file
 */
export async function downloadBadge(registration) {
    try {
        const FileSaver = (await import('file-saver')).default;

        const badgeHTML = await createBadge(registration);
        const blob = await convertBadgeToImage(badgeHTML);

        FileSaver.saveAs(blob, `${registration.badge_number}.png`);
    } catch (error) {
        console.error('Error downloading badge:', error);
        throw error;
    }
}

/**
 * Regenerate existing badge
 */
export async function regenerateBadge(registration) {
    try {
        if (!registration.badge_number) {
            throw new Error('Registration does not have a badge number');
        }

        const mealsIncluded = shouldIncludeMeals(registration);

        // Create new badge
        const badgeHTML = await createBadge(registration);
        const blob = await convertBadgeToImage(badgeHTML);

        // Upload with same badge number (overwrite)
        const badgeUrl = await uploadBadgeToStorage(registration.badge_number, blob);

        // Update registration with new URL (add timestamp to bust cache)
        const { error } = await supabase
            .from('registrations')
            .update({
                badge_url: `${badgeUrl}?t=${Date.now()}`,
                meals_included: mealsIncluded
            })
            .eq('id', registration.id);

        if (error) throw error;

        return badgeUrl;
    } catch (error) {
        console.error('Error regenerating badge:', error);
        throw error;
    }
}
