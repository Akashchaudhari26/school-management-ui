import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SetupService } from '../../../modules/setup/services/setup.service';

@Component({
  selector: 'app-startup',
  imports: [],
  templateUrl: './startup.html',
  styleUrl: './startup.css',
})
export class Startup {

  private readonly setupService = inject(SetupService);
  private readonly router = inject(Router);

  loading = true;
  error = false;

  ngOnInit(): void {
    this.setupService.getStatus().subscribe({
      next: (response) => {

        if (response.initialized) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/setup']);
        }

      },

      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  retry(): void {
    window.location.reload();
  }
}
