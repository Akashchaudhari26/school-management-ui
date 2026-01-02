import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveRequest } from '../../models/leave.model';
import { LeaveService } from '../../services/leave.service';
import { Auth } from '../../../../core/services/auth';
import { ToastService } from '../../../../core/services/toast';

@Component({
  selector: 'app-leave-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-list.component.html',
  styleUrl: './leave-list.component.css',
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  currentUserRole: string = '';
  currentUserId: string = '';
  isAdmin = false;

  activeTab: 'MY_LEAVES' | 'PENDING' | 'HISTORY' = 'MY_LEAVES';
  showApplyModal = false;
  isLoading = false;
  leaves: LeaveRequest[] = [];

  applyForm = this.fb.group({
    leaveType: ['CASUAL', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() {
    this.currentUserRole = this.auth.getRole();
    this.currentUserId = this.auth.getUser()?.userId || '';

    this.isAdmin = ['ADMIN', 'PRINCIPAL'].includes(this.currentUserRole);

    if (this.isAdmin) {
      this.activeTab = 'PENDING';
    }

    this.loadLeaves();
  }

  switchTab(tab: 'MY_LEAVES' | 'PENDING' | 'HISTORY') {
    this.activeTab = tab;
    this.loadLeaves();
  }

  loadLeaves() {
    this.isLoading = true;
    this.leaves = [];

    if (this.activeTab === 'MY_LEAVES') {
      this.leaveService.getMyLeaves(this.currentUserId).subscribe(data => {
        this.leaves = data;
        this.isLoading = false;
      });
    }
    else if (this.isAdmin) {
      this.leaveService.getAllLeaves().subscribe(data => {
        if (this.activeTab === 'PENDING') {
          this.leaves = data.filter(l => l.status === 'PENDING');
        } else {
          this.leaves = data.filter(l => l.status !== 'PENDING');
        }
        this.isLoading = false;
      });
    }
  }


  openApplyModal() { this.showApplyModal = true; }

  closeApplyModal() {
    this.showApplyModal = false;
    this.applyForm.reset({ leaveType: 'CASUAL' });
  }

  submitApplication() {
    if (this.applyForm.invalid) return;

    const user = this.auth.getUser();
    if (!user) return;

    const val = this.applyForm.value;

    const payload: Partial<LeaveRequest> = {
      userId: user.userId,
      userName: user.fullName,
      role: user.roleName,
      userType: 'STAFF',
      startDate: val.startDate!,
      endDate: val.endDate!,
      leaveType: val.leaveType as any,
      reason: val.reason!,
      status: 'PENDING'
    };

    this.isLoading = true;

    this.leaveService.applyLeave(payload).subscribe({
      next: () => {
        alert('Leave application submitted successfully!');
        this.closeApplyModal();
        this.loadLeaves();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to submit leave request.');
        this.isLoading = false;
      }
    });
  }
  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    if (!this.isAdmin) return;

    let reason = '';
    if (status === 'REJECTED') {
      reason = prompt('Reason for rejection:') || '';
      if (!reason) return;
    } else {
      if (!confirm('Confirm Approval?')) return;
    }

    this.leaveService.updateStatus(id, status, reason).subscribe(() => {
      this.loadLeaves();
    });
  }

  getStatusClass(status: string) {
    if (status === 'APPROVED') return 'badge-green';
    if (status === 'REJECTED') return 'badge-red';
    return 'badge-yellow';
  }

  onWithdraw(leave: any) {
    // 1. Safety Check: Don't allow withdrawing processed leaves (UI side check)
    if (leave.status !== 'PENDING') {
      this.toast.show('Only PENDING requests can be withdrawn.', 'warning');
      return;
    }

    // 2. Confirmation Dialog
    if (!confirm('Are you sure you want to withdraw this leave request?')) {
      return;
    }

    // 3. Call API
    this.leaveService.delete(leave.id).subscribe({
      next: () => {
        this.toast.show('Request withdrawn successfully', 'success');

        // 4. Remove from UI list immediately (no need to refresh page)
        this.leaves = this.leaves.filter(l => l.id !== leave.id);
      },
      error: (err) => {
        // Error is handled by your global interceptor now!
        console.error(err);
      }
    });
  }
}