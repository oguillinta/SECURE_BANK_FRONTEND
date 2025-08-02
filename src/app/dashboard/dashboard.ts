import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dashboard',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  onTransferClick() {
    console.log('Transfer money clicked');
    // Navigate to transfers page
  }

  onPayBillsClick() {
    console.log('Pay bills clicked');
    // Navigate to payments page
  }

  onDepositClick() {
    console.log('Make deposit clicked');
    // Navigate to deposit page
  }

  onStatementClick() {
    console.log('View statement clicked');
    // Navigate to statements page
  }
}
