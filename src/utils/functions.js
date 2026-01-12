
export function slugify(text) {
    return text
        .toString() // Ensure the input is a string
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading/trailing whitespace
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        // .replace(/[^\w-]+/g, '') // Remove all non-word characters (except hyphens)
        .replace(/--+/g, '-')
        .replace(/ /g, '-'); // Replace multiple hyphens with a single hyphen
}


export function slug(text) {
    return text
        .toString()                    // Ensure string
        .toLowerCase()                 // Convert to lowercase
        .trim()                        // Remove leading/trailing spaces
        .replace(/[^\w\s-]/g, '')      // Remove special characters
        .replace(/[\s_-]+/g, '-')      // Replace spaces/underscores with single hyphen
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

import { db } from '@/lib/db';
import { put } from '@vercel/blob'
export function fileToUrl(files) {
    let formData = new FormData()
    formData.append("file", files)
    const file = formData.get("file");
    console.log('file', file)

    // const blob = await put('files.name', formData.get('file'), {
    //     access: 'public'
    // })

    //console.log('blob', blob.url)

    //console.log(formData)

    return 'url'
}

export function uuid() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const first = letters[Math.floor(Math.random() * letters.length)];
    const second = letters[Math.floor(Math.random() * letters.length)];

    return (first + second + '-' + Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString())
}

export function getAge(dateString) {
    const dob = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // adjust if birthday hasn't arrived yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age < 0 ? 0 : age; // prevent negative age
}

export function getInitials(fullName) {
    if (!fullName) return ''

    const parts = fullName.trim().split(/\s+/)

    if (parts.length === 1) {
        // Single word: take first 2 letters
        return parts[0].slice(0, 2).toUpperCase()
    }

    const first = parts[0][0] || ''
    const last = parts[parts.length - 1][0] || ''

    return (first + last).toUpperCase()
}


export function encryptAndStore(keyName, data, password) {
    // Derive key from password
    const enc = new TextEncoder();
    const keyMaterial = crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );

    // Encrypt data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(JSON.stringify(data))
    );

    // Store with metadata
    const record = {
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
    };
    localStorage.setItem(keyName, JSON.stringify(record));
}

export function retrieveAndDecrypt(keyName, password) {
    const stored = localStorage.getItem(keyName);
    if (!stored) return null;

    const record = JSON.parse(stored);
    const enc = new TextEncoder();
    const keyMaterial = crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const key = crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new Uint8Array(record.salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );

    const decrypted = crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(record.iv) },
        key,
        new Uint8Array(record.data)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
}

export function generatePatientSku(input) {
    const { fullName, dateOfBirth, gender, primaryPhone } = input

    // initials from name
    const cleanedName = fullName.trim().replace(/\s+/g, " ")
    const initials = cleanedName
        .split(" ")
        .filter(Boolean)
        .slice(0, 3)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "PT"

    // date part: yymmdd from yyyy-mm-dd
    let datePart = "000000"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        const [y, m, d] = dateOfBirth.split("-")
        datePart = `${y.slice(2)}${m}${d}`
    }

    // phone: last 4 digits
    const digits = primaryPhone.replace(/\D/g, "")
    const phonePart = digits.slice(-4) || "0000"

    // gender code
    const g = gender?.toLowerCase()
    const genderCode =
        g === "male" ? "M" : g === "female" ? "F" : g === "other" ? "O" : "U"

    // final SKU
    return `PT-${initials}-${datePart}-${phonePart}-${genderCode}`
}

import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('0123456789abcdef', 8); // 8 chars, 2^32 possibilities
const DOMAIN = 'hospital.temp'; // Your custom domain

export function generateUniqueTempEmail() {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        // Generate random local part: patient + 8 chars
        const randomPart = `patient${nanoid()}`;
        const tempEmail = `${randomPart}@${DOMAIN}`;

        // Check if exists in DB



        return tempEmail;


        attempts++;
    }

    throw new Error('Failed to generate unique temp email after 5 attempts');
}

export function titleCaseLabel(value = "") {
    return value
        .toString()
        .trim()
        .replace(/[-_]+/g, " ")          // replace - and _ with space
        .replace(/\s+/g, " ")            // collapse multiple spaces
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
}


