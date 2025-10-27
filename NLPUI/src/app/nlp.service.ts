import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChatRequest, ChatResponse, ModelsResponse, TextCompletionRequest } from './models/models';

@Injectable({ providedIn: 'root' })
export class NlpService {
  private apiUrl = environment.apiUrl;
  private readonly REQUEST_TIMEOUT = 120000; // 120 seconds for AI responses

  constructor(private http: HttpClient) {
    console.log('NlpService initialized with API URL:', this.apiUrl);
  }

  /**
   * Submit a chat completion request
   */
  complete(request: TextCompletionRequest): Observable<ChatResponse> {


    if (!request.model) {
      return throwError(() => new Error('Model must be specified'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Submitting completion request:', request);

    return this.http.post<any>(`${this.apiUrl}/ask`, request, { headers }).pipe(
      map((resp: any) => {
        let obj = resp;

        // Convert string JSON into object if needed
        if (typeof resp === 'string') {
          try {
            obj = JSON.parse(resp);
          } catch (e) {
            console.error('Failed to parse JSON string response', e);
            throw e;
          }
        }

        // Normalize ChatResponse structure
        const mapped: ChatResponse = {
          id: obj.id ?? '',
          object: obj.object ?? '',
          created: typeof obj.created === 'string' ? Number(obj.created) : obj.created ?? Date.now(),
          model: obj.model ?? '',
          choices: (obj.choices ?? []).map((c: any) => ({
            index: c.index ?? 0,
            message: {
              role: c.message?.role ?? 'assistant',
              content: c.message?.content ?? c.text ?? ''
            },
            logprobs: c.logprobs ?? null,
            finish_reason: c.finish_reason ?? c.finishReason ?? 'stop'
          })),
          usage: {
            queue_time: obj.usage?.queue_time ?? 0,
            prompt_tokens: obj.usage?.prompt_tokens ?? 0,
            prompt_time: obj.usage?.prompt_time ?? 0,
            completion_tokens: obj.usage?.completion_tokens ?? 0,
            completion_time: obj.usage?.completion_time ?? 0,
            total_tokens: obj.usage?.total_tokens ?? 0,
            total_time: obj.usage?.total_time ?? 0
          },
          usage_breakdown: obj.usage_breakdown ?? null,
          system_fingerprint: obj.system_fingerprint ?? '',
          x_groq: { id: obj.x_groq?.id ?? '' },
          service_tier: obj.service_tier ?? ''
        };

        return mapped;
      }),
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Get available models
   */
  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${this.apiUrl}/models`).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  /**
   * Health check endpoint
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      timeout(5000),
      catchError(this.handleError)
    );
  }

  /**
   * Generic HTTP error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 408:
          errorMessage = 'Request timeout.';
          break;
        case 429:
          errorMessage = 'Too many requests. Try again later.';
          break;
        case 500:
          errorMessage = 'Internal server error.';
          break;
        case 503:
          errorMessage = 'Service unavailable.';
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
