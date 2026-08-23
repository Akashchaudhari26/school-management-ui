export interface Address {

    line1?: string;

    line2?: string;

    village?: string;

    city?: string;

    district?: string;

    state?: string;

    country?: string;

    pinCode?: string;

    latitude?: number;

    longitude?: number;

}

export interface Branding {

    logo?: string;

    primaryColor?: string;

    secondaryColor?: string;

    website?: string;

}

export interface Contact {

    email: string;

    phone: string;

    alternatePhone?: string;

    whatsapp?: string;

}

export interface Management {

    ownerId?: string;

    principalId?: string;

    vicePrincipalId?: string;

}

export interface Registration {

    registrationNumber?: string;

    udiseCode?: string;

    affiliationNumber?: string;

    gstNumber?: string;

    panNumber?: string;

}