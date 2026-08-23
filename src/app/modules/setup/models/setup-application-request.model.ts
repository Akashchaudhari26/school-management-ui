import { Address, Branding, Contact, Management, Registration } from "./common-dto.model";

export interface SetupApplicationRequest {

    school: CreateSchoolRequest;

    admin: CreateAdminRequest;

}

export interface CreateAdminRequest {

    fullName: string;

    email: string;

    mobile: string;

    password: string;

}

export interface CreateSchoolRequest {

    schoolName: string;

    shortName?: string;

    tagline?: string;

    description?: string;

    branding?: Branding;

    contact: Contact;

    address: Address;

    management?: Management;

    registration?: Registration;

}