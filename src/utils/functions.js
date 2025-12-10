
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

const getInitials = (fullName) => {
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




