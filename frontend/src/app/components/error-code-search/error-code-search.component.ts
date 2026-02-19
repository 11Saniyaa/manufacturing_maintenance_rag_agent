import { Component, OnInit } from '@angular/core';
import { ApiService, ErrorCode } from '../../services/api.service';

@Component({
  selector: 'app-error-code-search',
  templateUrl: './error-code-search.component.html',
  styleUrls: ['./error-code-search.component.css'],
})
export class ErrorCodeSearchComponent implements OnInit {
  searchTerm: string = '';
  errorCodes: ErrorCode[] = [];
  searchResults: ErrorCode[] = [];
  isSearching: boolean = false;
  selectedErrorCode: ErrorCode | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAllErrorCodes();
  }

  loadAllErrorCodes() {
    this.apiService.getErrorCodes().subscribe({
      next: (errorCodes) => {
        this.errorCodes = errorCodes;
      },
      error: (error) => {
        console.error('Error loading error codes:', error);
      },
    });
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      this.selectedErrorCode = null;
      return;
    }

    this.isSearching = true;
    this.apiService.searchErrorCodes(this.searchTerm).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
        if (results.length > 0) {
          this.selectedErrorCode = results[0];
        } else {
          this.selectedErrorCode = null;
        }
      },
      error: (error) => {
        console.error('Error searching error codes:', error);
        this.isSearching = false;
      },
    });
  }

  selectErrorCode(errorCode: ErrorCode) {
    this.selectedErrorCode = errorCode;
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedErrorCode = null;
  }
}

