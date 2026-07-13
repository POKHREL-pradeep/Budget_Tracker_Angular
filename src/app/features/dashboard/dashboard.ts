import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink, MatSelectModule, MatFormFieldModule, TranslocoModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translocoService = inject(TranslocoService);

  currentLang = this.translocoService.getActiveLang();

  availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ne', label: 'नेपाली' },
  ];

  onLanguageChange(langCode: string): void {
    this.translocoService.setActiveLang(langCode);
    this.currentLang = langCode;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
