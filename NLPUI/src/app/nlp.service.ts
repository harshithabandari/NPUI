import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TextCompletionRequest, TextCompletionResponse, ModelsResponse } from './models/models';

export interface NlpAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  tokens: string[];
}

@Injectable({ providedIn: 'root' })
export class NlpService {
  private apiUrl = environment.apiUrl;
  private readonly REQUEST_TIMEOUT = 120000; // 120 seconds for AI responses

  constructor(private http: HttpClient) {
    console.log('CompletionService initialized with API URL:', this.apiUrl);
  }

  /**
   * Submit a text completion request
   */
  complete(request: TextCompletionRequest): Observable<TextCompletionResponse> {
    if (!request.prompt || request.prompt.trim().length === 0) {
      return throwError(() => new Error('Question cannot be empty'));
    }

    if (!request.model) {
      return throwError(() => new Error('Model must be specified'));
    }
   request.model = "google/gemma-2-9b";
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Submitting completion request:', request);

    return this.http.post<TextCompletionResponse>(
      `${this.apiUrl}/ask`,
      request,
      { headers }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1), // Retry once on failure
      catchError(this.handleError)
    );
  }

  /**
   * Retrieve a completion by ID
   */
  getCompletionById(id: number): Observable<TextCompletionResponse> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid completion ID'));
    }

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<TextCompletionResponse>(
      `${this.apiUrl}/textcompletion/${id}`,
      { headers }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Get available models
   */
  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(
      `${this.apiUrl}/models`
    ).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  /**
   * Health check
   */
  healthCheck(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/textcompletion/health`
    ).pipe(
      timeout(5000),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Client-side error:', error.error.message);
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 408:
          errorMessage = 'Request timeout. The server took too long to respond.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }
}
