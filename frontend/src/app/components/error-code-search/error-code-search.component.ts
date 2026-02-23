import { Component } from '@angular/core';
import { ErrorCodeService, ErrorCode } from '../../services/error-code.service';

@Component({
  selector: 'app-error-code-search',
  templateUrl: './error-code-search.component.html',
  styleUrls: ['./error-code-search.component.css']
})
export class ErrorCodeSearchComponent {
  searchKeyword: string = '';
  errorCodes: ErrorCode[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor(private errorCodeService: ErrorCodeService) { }

  search() {
    if (!this.searchKeyword.trim()) {
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.errorCodeService.searchErrorCodes(this.searchKeyword).subscribe({
      next: (codes) => {
        this.errorCodes = codes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching error codes:', error);
        this.errorCodes = [];
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  clearSearch() {
    this.searchKeyword = '';
    this.errorCodes = [];
    this.hasSearched = false;
  }
}




