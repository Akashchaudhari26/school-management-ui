import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SetupService } from '../../services/setup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './setup.html',
  styleUrl: './setup.css'
})
export class Setup {

  private readonly fb = inject(NonNullableFormBuilder);

  private readonly setupService = inject(SetupService);

  private readonly router = inject(Router);

  currentStep = 0;

  readonly steps = [
    'School Information',
    'Contact Information',
    'Address',
    'Registration',
    'Administrator'
  ];

  next(): void {

    if (!this.isCurrentStepValid()) {
      return;
    }

    if (this.currentStep < this.steps.length - 1) {

      this.currentStep++;

    }

  }

  previous(): void {

    if (this.currentStep > 0) {

      this.currentStep--;

    }

  }

  setupForm = this.fb.group({

    school: this.fb.group({

      schoolName: ['', Validators.required],

      shortName: [''],

      tagline: [''],

      description: [''],

      branding: this.fb.group({

        logo: [''],

        primaryColor: [''],

        secondaryColor: [''],

        website: ['']

      }),

      contact: this.fb.group({

        email: ['', [Validators.required, Validators.email]],

        phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],

        alternatePhone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],

        whatsapp: ['', [Validators.pattern(/^[6-9]\d{9}$/)]]

      }),

      address: this.fb.group({

        line1: ['', Validators.required],

        line2: [''],

        village: [''],

        city: ['', Validators.required],

        district: ['', Validators.required],

        state: ['', Validators.required],

        country: ['India', Validators.required],

        pinCode: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[1-9][0-9]{5}$/)
          ]
        ],

        latitude: [0],

        longitude: [0]

      }),

      management: this.fb.group({

        ownerId: [''],

        principalId: [''],

        vicePrincipalId: ['']

      }),

      registration: this.fb.group({

        registrationNumber: [
          '',
          Validators.required
        ],

        udiseCode: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{11}$/)
          ]
        ],

        affiliationNumber: [''],

        gstNumber: [
          '',
          Validators.pattern(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
          )
        ],

        panNumber: [
          '',
          Validators.pattern(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
          )
        ]

      }),

    }),

    admin: this.fb.group({

      fullName: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]

    })

  });

  loading = false;

  get school() {
    return this.setupForm.controls.school;
  }

  get admin() {
    return this.setupForm.controls.admin;
  }

  get branding() {
    return this.school.controls.branding;
  }

  get contact() {
    return this.school.controls.contact;
  }

  get address() {
    return this.school.controls.address;
  }

  get registration() {
    return this.school.controls.registration;
  }

  get management() {
    return this.school.controls.management;
  }

  get password() {
    return this.admin.controls.password;
  }

  get confirmPassword() {
    return this.admin.controls.confirmPassword;
  }


  isCurrentStepValid(): boolean {

    switch (this.currentStep) {

      case 0:
        return this.setupForm.get('school.schoolName')!.valid;

      case 1:
        return this.setupForm.get('school.contact')!.valid;

      case 2:
        return this.address.valid;

      case 3:
        return this.registration.valid;

      case 4:
        return this.admin.valid &&
          this.passwordsMatch();

      default:
        return false;

    }

  }

  submit(): void {

    if (this.setupForm.invalid || !this.passwordsMatch()) {

      this.setupForm.markAllAsTouched();

      return;

    }

    this.loading = true;

    const request = this.setupForm.getRawValue();

    const payload = {

      ...request,

      admin: {

        fullName: request.admin.fullName,

        email: request.admin.email,

        mobile: request.admin.mobile,

        password: request.admin.password

      }

    };

    this.setupService.initialize(payload).subscribe({

      next: () => {

        this.router.navigate(['/login']);

      },

      error: () => {

        this.loading = false;

      }

    });

  }
  passwordsMatch(): boolean {

    return this.password.value ===
      this.confirmPassword.value;

  }
}